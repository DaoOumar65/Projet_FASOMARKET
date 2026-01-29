import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/vendeur';

export interface SimpleVariante {
  id: number;
  couleur: string;
  taille: string;
  stock?: number;
}

export interface StockInfo {
  stockTotal: number;
  stockDisponible: number;
  variantes: SimpleVariante[];
}

class SimpleVariantesService {
  async getVariantes(produitId: string | number): Promise<SimpleVariante[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/produits/${produitId}/variantes`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur getVariantes:', error);
      return [];
    }
  }

  async creerVariante(produitId: string | number, variante: Omit<SimpleVariante, 'id'>): Promise<SimpleVariante | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/produits/${produitId}/variantes`, variante);
      return response.data;
    } catch (error) {
      console.error('Erreur creerVariante:', error);
      return null;
    }
  }

  async getStockInfo(produitId: string | number): Promise<StockInfo> {
    try {
      const variantes = await this.getVariantes(produitId);
      const stockTotal = variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
      
      return {
        stockTotal,
        stockDisponible: stockTotal,
        variantes
      };
    } catch (error) {
      console.error('Erreur getStockInfo:', error);
      return {
        stockTotal: 0,
        stockDisponible: 0,
        variantes: []
      };
    }
  }
}

export const simpleVariantesService = new SimpleVariantesService();