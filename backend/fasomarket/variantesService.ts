// services/variantesService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/vendeur/produits';

// Types TypeScript
export interface Variante {
  id: number;
  produitId: string;
  couleur: string;
  taille: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  status?: string;
}

export interface VarianteRequest {
  couleur: string;
  taille: string;
  modele?: string;
  prixAjustement?: number;
  stock: number;
  materiau?: string;
  genre?: string;
}

export interface StockInfo {
  stockGlobal: number;
  stockVariantesTotal: number;
  stockDisponible: number;
  stockValide: boolean;
}

// Configuration axios
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'X-User-Id': userId || '',
    'Content-Type': 'application/json'
  };
};

// Service des variantes
export const variantesService = {
  // Récupérer les variantes d'un produit
  async getVariantes(produitId: string): Promise<Variante[]> {
    try {
      console.log('🔄 Chargement variantes pour produit:', produitId);
      
      const response = await axios.get(`${API_BASE_URL}/${produitId}/variantes`, {
        headers: getHeaders()
      });
      
      console.log('✅ Variantes chargées:', response.data);
      return response.data || [];
      
    } catch (error: any) {
      console.error('❌ Erreur chargement variantes:', error);
      
      // Gestion spécifique des erreurs
      if (error.response?.status === 500) {
        console.warn('⚠️ Erreur serveur 500 - utilisation liste vide');
        return [];
      }
      
      throw error;
    }
  },

  // Créer une nouvelle variante
  async createVariante(produitId: string, variante: VarianteRequest): Promise<Variante> {
    try {
      console.log('🔄 Création variante:', variante);
      
      const response = await axios.post(`${API_BASE_URL}/${produitId}/variantes`, variante, {
        headers: getHeaders()
      });
      
      console.log('✅ Variante créée:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur création variante:', error);
      throw error;
    }
  },

  // Modifier une variante
  async updateVariante(produitId: string, varianteId: number, variante: Partial<VarianteRequest>): Promise<Variante> {
    try {
      console.log('🔄 Modification variante:', varianteId, variante);
      
      const response = await axios.put(`${API_BASE_URL}/${produitId}/variantes/${varianteId}`, variante, {
        headers: getHeaders()
      });
      
      console.log('✅ Variante modifiée:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur modification variante:', error);
      throw error;
    }
  },

  // Supprimer une variante
  async deleteVariante(produitId: string, varianteId: number): Promise<boolean> {
    try {
      console.log('🔄 Suppression variante:', varianteId);
      
      const response = await axios.delete(`${API_BASE_URL}/${produitId}/variantes/${varianteId}`, {
        headers: getHeaders()
      });
      
      console.log('✅ Variante supprimée:', response.data);
      return response.data.success || true;
      
    } catch (error: any) {
      console.error('❌ Erreur suppression variante:', error);
      throw error;
    }
  },

  // Récupérer les informations de stock
  async getStockInfo(produitId: string): Promise<StockInfo> {
    try {
      console.log('🔄 Chargement info stock pour produit:', produitId);
      
      const response = await axios.get(`${API_BASE_URL}/${produitId}/stock-disponible`, {
        headers: getHeaders()
      });
      
      console.log('✅ Info stock chargée:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur chargement stock:', error);
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        stockGlobal: 0,
        stockVariantesTotal: 0,
        stockDisponible: 0,
        stockValide: true
      };
    }
  }
};

export default variantesService;