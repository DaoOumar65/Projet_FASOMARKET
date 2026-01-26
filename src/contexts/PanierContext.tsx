import React, { useState, useEffect, type ReactNode } from 'react';
import type { PanierItem } from '../types';
import { clientService, publicService } from '../services/api';
import { useAuthStore } from '../store';
import { PanierContext, type PanierContextType } from './PanierContextDef';

interface PanierProviderProps {
  children: ReactNode;
}

// Stockage local temporaire du panier
const PANIER_STORAGE_KEY = 'fasomarket_panier';

export default function PanierProvider({ children }: PanierProviderProps) {
  const [panierItems, setPanierItems] = useState<PanierItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Charger le panier depuis le localStorage
  const chargerPanierLocal = () => {
    try {
      const savedPanier = localStorage.getItem(PANIER_STORAGE_KEY);
      if (savedPanier) {
        const items = JSON.parse(savedPanier);
        // Filtrer les items invalides et s'assurer que chaque item a une boutique valide
        const validItems = items
          .filter((item: any) => item && item.produit && item.produit.id)
          .map((item: any) => ({
            ...item,
            produit: {
              ...item.produit,
              boutique: item.produit?.boutique || {
                id: '',
                nom: 'Boutique inconnue',
                description: '',
                categorie: '',
                adresse: 'Adresse non disponible',
                livraison: false,
                fraisLivraison: 0,
                statut: 'ACTIVE'
              }
            },
            // Conserver les détails des variantes s'ils existent
            couleurSelectionnee: item.couleurSelectionnee || item.variante?.couleur,
            tailleSelectionnee: item.tailleSelectionnee || item.variante?.taille,
            modeleSelectionne: item.modeleSelectionne || item.variante?.modele
          }));
        setPanierItems(validItems);
        setTotal(validItems.reduce((sum: number, item: PanierItem) => 
          sum + ((item.produit?.prix || 0) * item.quantite), 0));
      }
    } catch (error) {
      console.error('Erreur chargement panier local:', error);
      // En cas d'erreur, vider le panier corrompu
      localStorage.removeItem(PANIER_STORAGE_KEY);
      setPanierItems([]);
      setTotal(0);
    }
  };

  // Sauvegarder le panier dans le localStorage
  const sauvegarderPanierLocal = (items: PanierItem[]) => {
    try {
      localStorage.setItem(PANIER_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erreur sauvegarde panier local:', error);
    }
  };

  const chargerPanier = async () => {
    if (!isAuthenticated) {
      chargerPanierLocal();
      return;
    }

    // Vérifier le rôle de l'utilisateur - le panier n'est que pour les clients
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'CLIENT') {
      setPanierItems([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const response = await clientService.getPanier();
      const items = response.data;
      
      // Enrichir les items avec les détails des variantes
      const enrichedItems = await Promise.all(items.map(async (item: any) => {
        if (item.varianteId) {
          try {
            const variantesResponse = await publicService.getProduitVariantes(item.produit.id);
            const variante = variantesResponse.data.find((v: any) => v.id === item.varianteId);
            return {
              ...item,
              variante,
              couleurSelectionnee: variante?.couleur,
              tailleSelectionnee: variante?.taille,
              modeleSelectionne: variante?.modele
            };
          } catch (error) {
            console.log('Erreur chargement variante:', error);
            return item;
          }
        }
        return item;
      }));
      
      setPanierItems(enrichedItems);
      const totalPrice = enrichedItems.reduce((sum: number, item: PanierItem) => {
        const prix = item.variante?.prixAjustement || item.produit.prix;
        return sum + (prix * item.quantite);
      }, 0);
      setTotal(totalPrice);
    } catch (error: any) {
      // Utiliser le stockage local comme fallback
      console.log('Backend panier non disponible, utilisation du stockage local');
      chargerPanierLocal();
    } finally {
      setLoading(false);
    }
  };

  const ajouterAuPanier = async (produitId: string, quantite: number, varianteId?: string) => {
    try {
      // Récupérer les détails de la variante si spécifiée
      let variante = null;
      if (varianteId) {
        try {
          const variantesResponse = await publicService.getProduitVariantes(produitId);
          variante = variantesResponse.data.find((v: any) => v.id === varianteId);
        } catch (error) {
          console.log('Erreur chargement variante:', error);
        }
      }

      // Récupérer les détails du produit
      const produitResponse = await publicService.getProduit(produitId);
      const rawProduit = produitResponse.data as any;
      
      // Mapper les données du produit avec boutique
      const produit = {
        ...rawProduit,
        nom: rawProduit.nom || rawProduit.name || 'Produit sans nom',
        prix: rawProduit.prix || rawProduit.price || 0,
        images: rawProduit.images ? 
          (typeof rawProduit.images === 'string' ? 
            rawProduit.images.split(',').map((img: string) => img.trim()) : 
            rawProduit.images
          ) : 
          ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
        boutique: {
          id: rawProduit.boutiqueId || rawProduit.boutique?.id || '',
          nom: rawProduit.nomBoutique || rawProduit.boutique?.nom || 'Boutique inconnue',
          description: rawProduit.boutique?.description || '',
          categorie: rawProduit.boutique?.categorie || '',
          adresse: rawProduit.boutique?.adresse || 'Adresse non disponible',
          livraison: rawProduit.boutique?.livraison || false,
          fraisLivraison: rawProduit.boutique?.fraisLivraison || 0,
          statut: rawProduit.boutique?.statut || 'ACTIVE'
        }
      };

      // Vérifier si le produit avec cette variante existe déjà dans le panier
      const existingItemIndex = Array.isArray(panierItems) ? panierItems.findIndex(item => 
        item && item.produit && item.produit.id === produitId && item.varianteId === varianteId
      ) : -1;
      let newItems: PanierItem[];

      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité
        newItems = [...(Array.isArray(panierItems) ? panierItems : [])];
        newItems[existingItemIndex].quantite += quantite;
      } else {
        // Ajouter un nouveau produit
        const newItem: PanierItem = {
          id: Date.now().toString(),
          produit: produit as any,
          quantite,
          varianteId,
          variante: variante || undefined,
          couleurSelectionnee: variante?.couleur,
          tailleSelectionnee: variante?.taille,
          modeleSelectionne: variante?.modele
        };
        newItems = [...(Array.isArray(panierItems) ? panierItems : []), newItem];
      }

      setPanierItems(newItems);
      const totalPrice = newItems.reduce((sum: number, item: PanierItem) => {
        const prix = item.variante?.prixAjustement || item.produit?.prix || 0;
        return sum + (prix * item.quantite);
      }, 0);
      setTotal(totalPrice);
      sauvegarderPanierLocal(newItems);

      // Essayer de synchroniser avec le backend si connecté
      if (isAuthenticated) {
        const user = useAuthStore.getState().user;
        if (user && user.role === 'CLIENT') {
          try {
            await clientService.ajouterAuPanier(produitId, quantite, varianteId);
            console.log('Synchronisation backend réussie');
          } catch (error) {
            console.error('Synchronisation backend échouée:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const supprimerDuPanier = async (itemId: string) => {
    try {
      const newItems = panierItems.filter(item => item.id !== itemId);
      setPanierItems(newItems);
      setTotal(newItems.reduce((sum: number, item: PanierItem) => 
        sum + ((item.produit?.prix || 0) * item.quantite), 0));
      sauvegarderPanierLocal(newItems);

      // Ignorer les erreurs backend - utiliser uniquement le stockage local
      if (isAuthenticated) {
        const user = useAuthStore.getState().user;
        if (user && user.role === 'CLIENT') {
          try {
            await clientService.supprimerDuPanier(itemId);
          } catch (error) {
            // Ignorer silencieusement les erreurs backend
            console.log('Backend non disponible, utilisation du stockage local uniquement');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const synchroniserAvecBackend = async () => {
    if (!isAuthenticated) return false;
    
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'CLIENT') return false;

    try {
      // Vider d'abord le panier backend
      await clientService.viderPanier();
      
      // Ajouter tous les produits du panier local au backend
      for (const item of panierItems) {
        if (item.produit?.id) {
          await clientService.ajouterAuPanier(item.produit.id, item.quantite, item.varianteId);
        }
      }
      
      console.log('Synchronisation backend réussie');
      return true;
    } catch (error) {
      console.error('Erreur synchronisation backend:', error);
      return false;
    }
  };

  const viderPanier = async () => {
    try {
      setPanierItems([]);
      setTotal(0);
      localStorage.removeItem(PANIER_STORAGE_KEY);

      // Ignorer les erreurs backend - utiliser uniquement le stockage local
      if (isAuthenticated) {
        const user = useAuthStore.getState().user;
        if (user && user.role === 'CLIENT') {
          try {
            await clientService.viderPanier();
          } catch (error) {
            // Ignorer silencieusement les erreurs backend
            console.log('Backend non disponible, utilisation du stockage local uniquement');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
    }
  };

  const modifierQuantite = async (itemId: string, nouvelleQuantite: number) => {
    if (nouvelleQuantite <= 0) {
      await supprimerDuPanier(itemId);
      return;
    }

    try {
      const newItems = panierItems.map(item => 
        item.id === itemId ? { ...item, quantite: nouvelleQuantite } : item
      );
      setPanierItems(newItems);
      setTotal(newItems.reduce((sum: number, item: PanierItem) => 
        sum + ((item.produit?.prix || 0) * item.quantite), 0));
      sauvegarderPanierLocal(newItems);
    } catch (error) {
      console.error('Erreur lors de la modification de quantité:', error);
    }
  };

  useEffect(() => {
    chargerPanier();
  }, [isAuthenticated]);

  // Charger le panier au démarrage
  useEffect(() => {
    chargerPanierLocal();
  }, []);

  return (
    <PanierContext.Provider value={{
      panierItems,
      total,
      loading,
      ajouterAuPanier,
      supprimerDuPanier,
      modifierQuantite,
      chargerPanier,
      viderPanier,
      synchroniserAvecBackend
    }}>
      {children}
    </PanierContext.Provider>
  );
}
