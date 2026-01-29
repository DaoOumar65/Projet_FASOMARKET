import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/vendeur';

export interface FinalVariante {
  id: number;
  couleur: string;
  taille: string;
  stock?: number;
  statut?: string; // ✅ Ajout du champ statut
}

export interface ConnectionStatus {
  isConnected: boolean;
  mode: 'connected' | 'degraded';
  lastCheck: Date;
}

class FinalVariantesService {
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    mode: 'degraded',
    lastCheck: new Date()
  };

  private simulatedVariantes: FinalVariante[] = [
    { id: 1, couleur: 'Rouge', taille: 'S', stock: 10, statut: 'ACTIF' },
    { id: 2, couleur: 'Bleu', taille: 'M', stock: 15, statut: 'ACTIF' },
    { id: 3, couleur: 'Vert', taille: 'L', stock: 8, statut: 'ACTIF' }
  ];

  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
      this.connectionStatus = {
        isConnected: true,
        mode: 'connected',
        lastCheck: new Date()
      };
      return true;
    } catch (error) {
      this.connectionStatus = {
        isConnected: false,
        mode: 'degraded',
        lastCheck: new Date()
      };
      return false;
    }
  }

  async getVariantes(produitId: string | number): Promise<FinalVariante[]> {
    const isConnected = await this.checkConnection();
    
    if (isConnected) {
      try {
        const response = await axios.get(`${API_BASE_URL}/produits/${produitId}/variantes`);
        // ✅ Mapping correct avec statut par défaut
        const variantes = (response.data || []).map((v: any) => ({
          id: v.id || Date.now(),
          couleur: v.couleur || 'Non défini',
          taille: v.taille || 'Non défini',
          stock: v.stock || 0,
          statut: v.statut || 'ACTIF' // ✅ Statut par défaut
        }));
        return variantes;
      } catch (error) {
        console.warn('Backend indisponible, mode dégradé activé');
      }
    }
    
    // Mode dégradé - données simulées avec statut
    return this.simulatedVariantes.map(v => ({
      ...v,
      statut: 'ACTIF' // ✅ Statut par défaut en mode dégradé
    }));
  }

  async creerVariante(produitId: string | number, variante: Omit<FinalVariante, 'id'>): Promise<FinalVariante> {
    const isConnected = await this.checkConnection();
    
    if (isConnected) {
      try {
        const response = await axios.post(`${API_BASE_URL}/produits/${produitId}/variantes`, variante);
        return response.data;
      } catch (error) {
        console.warn('Backend indisponible, simulation locale');
      }
    }
    
    // Mode dégradé - simulation locale
    const nouvelleVariante: FinalVariante = {
      id: Date.now(),
      ...variante,
      stock: variante.stock || 0,
      statut: 'ACTIF' // ✅ Statut par défaut pour nouvelles variantes
    };
    
    this.simulatedVariantes.push(nouvelleVariante);
    return nouvelleVariante;
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }
}

export const finalVariantesService = new FinalVariantesService();