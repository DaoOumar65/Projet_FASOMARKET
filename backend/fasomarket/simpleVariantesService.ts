// services/simpleVariantesService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/variantes';

export interface SimpleVariante {
  id: number;
  produitId: string;
  couleur: string;
  taille: string;
  stock: number;
  sku: string;
  status?: string;
}

export interface SimpleStockInfo {
  stockGlobal: number;
  stockVariantesTotal: number;
  stockDisponible: number;
  stockValide: boolean;
}

export const simpleVariantesService = {
  // Récupérer les variantes d'un produit
  async getVariantes(produitId: string): Promise<SimpleVariante[]> {
    try {
      console.log('🔄 Chargement variantes (nouveau mapping):', produitId);
      
      const response = await axios.get(`${API_BASE_URL}/produit/${produitId}`);
      
      console.log('✅ Variantes chargées:', response.data);
      return response.data || [];
      
    } catch (error: any) {
      console.error('❌ Erreur chargement variantes:', error);
      return [];
    }
  },

  // Créer une nouvelle variante
  async createVariante(produitId: string, variante: any): Promise<SimpleVariante> {
    try {
      console.log('🔄 Création variante (nouveau mapping):', variante);
      
      const response = await axios.post(`${API_BASE_URL}/produit/${produitId}`, variante, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Variante créée:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur création variante:', error);
      throw error;
    }
  },

  // Récupérer les informations de stock
  async getStockInfo(produitId: string): Promise<SimpleStockInfo> {
    try {
      console.log('🔄 Chargement stock (nouveau mapping):', produitId);
      
      const response = await axios.get(`${API_BASE_URL}/stock/${produitId}`);
      
      console.log('✅ Stock chargé:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur chargement stock:', error);
      
      return {
        stockGlobal: 0,
        stockVariantesTotal: 0,
        stockDisponible: 0,
        stockValide: true
      };
    }
  }
};

export default simpleVariantesService;