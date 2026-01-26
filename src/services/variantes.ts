import { api } from './api';

export const variantesService = {
  // Récupérer les variantes d'un produit (PUBLIC)
  getVariantesProduit: async (produitId: string) => {
    const response = await api.get(`/api/public/produits/${produitId}/variantes`);
    return response.data;
  },

  // VENDEUR - Gérer les variantes
  getVariantesVendeur: async (produitId: string) => {
    const response = await api.get(`/api/vendeur/produits/${produitId}/variantes`);
    return response.data;
  },

  creerVariante: async (produitId: string, variante: any) => {
    const response = await api.post(`/api/vendeur/produits/${produitId}/variantes`, variante);
    return response.data;
  },

  modifierVariante: async (produitId: string, varianteId: string, variante: any) => {
    const response = await api.put(`/api/vendeur/produits/${produitId}/variantes/${varianteId}`, variante);
    return response.data;
  },

  supprimerVariante: async (produitId: string, varianteId: string) => {
    await api.delete(`/api/vendeur/produits/${produitId}/variantes/${varianteId}`);
  },

  // Générer automatiquement les variantes
  genererVariantes: async (produitId: string) => {
    const response = await api.post(`/api/vendeur/produits/${produitId}/variantes/generer`);
    return response.data;
  }
};