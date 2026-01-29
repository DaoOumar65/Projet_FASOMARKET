import { useState, useEffect, useCallback } from 'react';
import { publicService } from '../services/api';

interface ProduitVariante {
  id: string;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
}

interface UseVariantesResult {
  variantes: ProduitVariante[];
  loading: boolean;
  error: string | null;
  selectedVariante: ProduitVariante | null;
  selectVariante: (variante: ProduitVariante | null) => void;
  getVariantesByOptions: (options: {
    couleur?: string;
    taille?: string;
    modele?: string;
  }) => ProduitVariante[];
  getUniqueValues: (field: keyof ProduitVariante) => string[];
  isOptionAvailable: (type: 'couleur' | 'taille' | 'modele', value: string, currentOptions?: any) => boolean;
  getTotalStock: () => number;
  getMinPrice: () => number;
  getMaxPrice: () => number;
}

// Cache simple pour éviter les requêtes répétées
const variantesCache = new Map<string, ProduitVariante[]>();

export function useVariantes(produitId: string): UseVariantesResult {
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariante, setSelectedVariante] = useState<ProduitVariante | null>(null);

  // Charger les variantes
  const loadVariantes = useCallback(async () => {
    if (!produitId) return;

    // Vérifier le cache d'abord
    if (variantesCache.has(produitId)) {
      const cachedVariantes = variantesCache.get(produitId)!;
      setVariantes(cachedVariantes);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await publicService.getProduitVariantes(produitId);
      const variantesData = response.data || [];
      
      // Trier les variantes par stock décroissant puis par prix croissant
      const sortedVariantes = variantesData.sort((a: ProduitVariante, b: ProduitVariante) => {
        if (a.stock !== b.stock) {
          return b.stock - a.stock; // Stock décroissant
        }
        return a.prixAjustement - b.prixAjustement; // Prix croissant
      });
      
      setVariantes(sortedVariantes);
      
      // Mettre en cache
      variantesCache.set(produitId, sortedVariantes);
      
      // Sélectionner automatiquement la première variante disponible
      const firstAvailable = sortedVariantes.find((v: ProduitVariante) => v.stock > 0);
      if (firstAvailable && !selectedVariante) {
        setSelectedVariante(firstAvailable);
      }
      
    } catch (err) {
      console.error('Erreur chargement variantes:', err);
      setError('Erreur lors du chargement des variantes');
      setVariantes([]);
    } finally {
      setLoading(false);
    }
  }, [produitId, selectedVariante]);

  useEffect(() => {
    loadVariantes();
  }, [loadVariantes]);

  // Sélectionner une variante
  const selectVariante = useCallback((variante: ProduitVariante | null) => {
    setSelectedVariante(variante);
  }, []);

  // Obtenir les variantes correspondant à des options spécifiques
  const getVariantesByOptions = useCallback((options: {
    couleur?: string;
    taille?: string;
    modele?: string;
  }) => {
    return variantes.filter(v => 
      (!options.couleur || v.couleur === options.couleur) &&
      (!options.taille || v.taille === options.taille) &&
      (!options.modele || v.modele === options.modele)
    );
  }, [variantes]);

  // Obtenir les valeurs uniques pour un champ
  const getUniqueValues = useCallback((field: keyof ProduitVariante): string[] => {
    const values = variantes
      .map(v => v[field])
      .filter(Boolean) as string[];
    return [...new Set(values)];
  }, [variantes]);

  // Vérifier si une option est disponible
  const isOptionAvailable = useCallback((
    type: 'couleur' | 'taille' | 'modele', 
    value: string, 
    currentOptions: any = {}
  ): boolean => {
    const testOptions = { ...currentOptions, [type]: value };
    return variantes.some(v => 
      v.stock > 0 &&
      (!testOptions.couleur || v.couleur === testOptions.couleur) &&
      (!testOptions.taille || v.taille === testOptions.taille) &&
      (!testOptions.modele || v.modele === testOptions.modele)
    );
  }, [variantes]);

  // Obtenir le stock total
  const getTotalStock = useCallback((): number => {
    return variantes.reduce((total, v) => total + v.stock, 0);
  }, [variantes]);

  // Obtenir le prix minimum
  const getMinPrice = useCallback((): number => {
    if (variantes.length === 0) return 0;
    return Math.min(...variantes.map(v => v.prixAjustement));
  }, [variantes]);

  // Obtenir le prix maximum
  const getMaxPrice = useCallback((): number => {
    if (variantes.length === 0) return 0;
    return Math.max(...variantes.map(v => v.prixAjustement));
  }, [variantes]);

  return {
    variantes,
    loading,
    error,
    selectedVariante,
    selectVariante,
    getVariantesByOptions,
    getUniqueValues,
    isOptionAvailable,
    getTotalStock,
    getMinPrice,
    getMaxPrice
  };
}

// Hook pour nettoyer le cache (utile pour les vendeurs qui modifient les variantes)
export function useClearVariantesCache() {
  return useCallback((produitId?: string) => {
    if (produitId) {
      variantesCache.delete(produitId);
    } else {
      variantesCache.clear();
    }
  }, []);
}