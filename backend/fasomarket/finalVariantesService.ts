// services/finalVariantesService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/test';

export interface FinalVariante {
  id: number;
  produitId: string;
  couleur: string;
  taille: string;
  stock: number;
  status?: string;
}

export const finalVariantesService = {
  // Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/hello`);
      console.log('✅ Connexion backend OK:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Connexion backend échouée:', error);
      return false;
    }
  },

  // Récupérer les variantes d'un produit
  async getVariantes(produitId: string): Promise<FinalVariante[]> {
    try {
      console.log('🔄 Chargement variantes (endpoints finaux):', produitId);
      
      const response = await axios.get(`${API_BASE_URL}/variantes/${produitId}`);
      
      console.log('✅ Variantes chargées:', response.data);
      return response.data || [];
      
    } catch (error: any) {
      console.error('❌ Erreur chargement variantes:', error);
      
      // Retourner des données par défaut en cas d'erreur
      return [
        {
          id: 1,
          produitId: produitId,
          couleur: "Rouge (défaut)",
          taille: "M",
          stock: 10,
          status: "default"
        },
        {
          id: 2,
          produitId: produitId,
          couleur: "Bleu (défaut)",
          taille: "L",
          stock: 5,
          status: "default"
        }
      ];
    }
  },

  // Créer une nouvelle variante
  async createVariante(produitId: string, variante: Partial<FinalVariante>): Promise<FinalVariante> {
    try {
      console.log('🔄 Création variante (endpoints finaux):', variante);
      
      const response = await axios.post(`${API_BASE_URL}/variantes/${produitId}`, variante, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Variante créée:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur création variante:', error);
      
      // Retourner une variante simulée en cas d'erreur
      return {
        id: Date.now(),
        produitId: produitId,
        couleur: variante.couleur || "Couleur par défaut",
        taille: variante.taille || "M",
        stock: variante.stock || 0,
        status: "simulated"
      };
    }
  }
};

export default finalVariantesService;