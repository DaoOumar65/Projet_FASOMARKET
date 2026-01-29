# 🚀 Guide d'intégration Frontend - Système de Variantes Complet

## 1. Types TypeScript mis à jour

```typescript
// types/index.ts
export interface ProduitVariante {
  id: number;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleCommande {
  id: string;
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  nomBoutique: string;
  // NOUVEAU - Infos variantes
  varianteId?: number;
  couleurSelectionnee?: string;
  tailleSelectionnee?: string;
  modeleSelectionne?: string;
  varianteInfo?: string; // Description lisible
}

export interface Commande {
  id: string;
  numeroCommande: string;
  statut: string;
  totalAmount: number;
  dateCommande: string;
  articles: ArticleCommande[]; // MISE À JOUR
  adresseLivraison?: string;
  needsDelivery: boolean;
}

export interface PanierItem {
  id: string;
  produitId: string;
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  // NOUVEAU - Support variantes
  varianteId?: number;
  couleurSelectionnee?: string;
  tailleSelectionnee?: string;
  modeleSelectionne?: string;
  varianteInfo?: string;
}
```

## 2. Service API mis à jour

```typescript
// services/api.ts
export const api = {
  // Variantes
  getVariantesProduit: async (produitId: string): Promise<ProduitVariante[]> => {
    const response = await fetch(`/api/public/produits/${produitId}/variantes`);
    return response.json();
  },

  // Panier avec variantes
  ajouterAuPanier: async (request: {
    produitId: string;
    quantite: number;
    varianteId?: number;
    couleurSelectionnee?: string;
    tailleSelectionnee?: string;
    modeleSelectionne?: string;
  }): Promise<PanierItem> => {
    const response = await fetch('/api/client/panier/ajouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': getUserId()
      },
      body: JSON.stringify(request)
    });
    return response.json();
  },

  // Commandes avec variantes
  getMesCommandes: async (): Promise<Commande[]> => {
    const response = await fetch('/api/client/historique-commandes', {
      headers: { 'X-User-Id': getUserId() }
    });
    return response.json();
  }
};
```

## 3. Composant Sélecteur de Variantes Amélioré

```tsx
// components/VarianteSelector.tsx
import React, { useState, useEffect } from 'react';

interface Props {
  produitId: string;
  prixBase: number;
  onVarianteChange: (variante: ProduitVariante | null, prixTotal: number) => void;
}

export const VarianteSelector: React.FC<Props> = ({ 
  produitId, 
  prixBase, 
  onVarianteChange 
}) => {
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [selection, setSelection] = useState<{
    couleur?: string;
    taille?: string;
    modele?: string;
  }>({});

  useEffect(() => {
    const loadVariantes = async () => {
      try {
        const data = await api.getVariantesProduit(produitId);
        setVariantes(data);
      } catch (error) {
        console.error('Erreur chargement variantes:', error);
      }
    };
    loadVariantes();
  }, [produitId]);

  useEffect(() => {
    // Trouver la variante correspondante
    const variante = variantes.find(v => 
      v.couleur === selection.couleur && 
      v.taille === selection.taille &&
      v.modele === selection.modele
    );
    
    const prixTotal = variante 
      ? prixBase + variante.prixAjustement 
      : prixBase;
    
    onVarianteChange(variante || null, prixTotal);
  }, [selection, variantes, prixBase]);

  const couleurs = [...new Set(variantes.map(v => v.couleur).filter(Boolean))];
  const tailles = [...new Set(variantes.map(v => v.taille).filter(Boolean))];
  const modeles = [...new Set(variantes.map(v => v.modele).filter(Boolean))];

  return (
    <div className="variante-selector space-y-4">
      {couleurs.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Couleur</label>
          <div className="flex flex-wrap gap-2">
            {couleurs.map(couleur => (
              <button
                key={couleur}
                onClick={() => setSelection(prev => ({ ...prev, couleur }))}
                className={`px-4 py-2 border rounded-lg ${
                  selection.couleur === couleur 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {couleur}
              </button>
            ))}
          </div>
        </div>
      )}

      {tailles.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Taille</label>
          <div className="flex flex-wrap gap-2">
            {tailles.map(taille => (
              <button
                key={taille}
                onClick={() => setSelection(prev => ({ ...prev, taille }))}
                className={`px-4 py-2 border rounded-lg ${
                  selection.taille === taille 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {taille}
              </button>
            ))}
          </div>
        </div>
      )}

      {modeles.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">Modèle</label>
          <select
            value={selection.modele || ''}
            onChange={(e) => setSelection(prev => ({ ...prev, modele: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un modèle</option>
            {modeles.map(modele => (
              <option key={modele} value={modele}>{modele}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
```

## 4. Page Détail Produit Mise à Jour

```tsx
// pages/DetailProduit.tsx
export const DetailProduit = () => {
  const [produit, setProduit] = useState<any>(null);
  const [varianteSelectionnee, setVarianteSelectionnee] = useState<ProduitVariante | null>(null);
  const [prixTotal, setPrixTotal] = useState<number>(0);
  const [quantite, setQuantite] = useState<number>(1);

  const handleVarianteChange = (variante: ProduitVariante | null, prix: number) => {
    setVarianteSelectionnee(variante);
    setPrixTotal(prix);
  };

  const handleAjouterPanier = async () => {
    if (!produit) return;

    const request = {
      produitId: produit.id,
      quantite,
      varianteId: varianteSelectionnee?.id,
      couleurSelectionnee: varianteSelectionnee?.couleur,
      tailleSelectionnee: varianteSelectionnee?.taille,
      modeleSelectionne: varianteSelectionnee?.modele
    };

    try {
      await api.ajouterAuPanier(request);
      // Succès
    } catch (error) {
      console.error('Erreur ajout panier:', error);
    }
  };

  const stockDisponible = varianteSelectionnee?.stock || produit?.stockQuantity || 0;
  const peutAjouter = stockDisponible >= quantite && quantite > 0;

  return (
    <div className="detail-produit">
      {/* Infos produit */}
      
      <VarianteSelector
        produitId={produit?.id}
        prixBase={produit?.price || 0}
        onVarianteChange={handleVarianteChange}
      />

      <div className="mt-6 space-y-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Quantité:</label>
          <input
            type="number"
            min="1"
            max={stockDisponible}
            value={quantite}
            onChange={(e) => setQuantite(parseInt(e.target.value))}
            className="w-20 px-3 py-2 border rounded-lg"
          />
          <span className="text-sm text-gray-500">
            ({stockDisponible} disponible{stockDisponible > 1 ? 's' : ''})
          </span>
        </div>

        <div className="text-2xl font-bold text-green-600">
          {prixTotal.toLocaleString()} FCFA
          {varianteSelectionnee?.prixAjustement !== 0 && (
            <span className="text-sm text-gray-500 ml-2">
              (+{varianteSelectionnee.prixAjustement} FCFA)
            </span>
          )}
        </div>

        <button
          onClick={handleAjouterPanier}
          disabled={!peutAjouter}
          className={`w-full py-3 px-6 rounded-lg font-medium ${
            peutAjouter
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {stockDisponible === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
};
```

## 5. Composant Article de Commande

```tsx
// components/ArticleCommande.tsx
interface Props {
  article: ArticleCommande;
}

export const ArticleCommande: React.FC<Props> = ({ article }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium">{article.nomProduit}</h4>
          <p className="text-sm text-gray-500">{article.nomBoutique}</p>
          
          {/* Infos variante */}
          {article.varianteInfo && (
            <div className="mt-2 text-sm">
              <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                {article.varianteInfo}
              </span>
            </div>
          )}
          
          <div className="mt-2 text-sm text-gray-600">
            Quantité: {article.quantite} × {article.prixUnitaire.toLocaleString()} FCFA
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-medium">
            {article.prixTotal.toLocaleString()} FCFA
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 6. Résumé des changements Frontend

### ✅ **Types mis à jour**
- `ProduitVariante`, `ArticleCommande`, `Commande`, `PanierItem`

### ✅ **Services API**
- Support variantes dans panier et commandes
- Endpoint variantes produit

### ✅ **Composants nouveaux/mis à jour**
- `VarianteSelector` - Sélection variantes
- `ArticleCommande` - Affichage avec variantes
- `DetailProduit` - Intégration complète

### ✅ **Fonctionnalités**
- Sélection variantes avec prix dynamique
- Gestion stock par variante
- Affichage variantes dans commandes
- Calcul prix total avec ajustements

Le système est maintenant **100% harmonisé** ! 🎯