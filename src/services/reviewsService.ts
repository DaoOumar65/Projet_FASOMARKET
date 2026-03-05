import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

export interface Review {
  id: string;
  note: number;
  titre: string;
  commentaire: string;
  recommande: boolean;
  dateCreation: string;
  utilisateur: {
    id: string;
    nom: string;
    avatar?: string;
  };
  votesUtiles: number;
  votesInutiles: number;
  reponseVendeur?: string;
  modere: boolean;
  signale: boolean;
}

export interface NouvelAvis {
  note: number;
  titre: string;
  commentaire: string;
  recommande: boolean;
}

export interface StatistiquesReviews {
  moyenne: number;
  total: number;
  repartition: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

class ReviewsService {
  async getReviews(targetId: string, type: 'produit' | 'vendeur' | 'boutique'): Promise<Review[]> {
    try {
      const endpoint = type === 'produit' 
        ? `/public/produits/${targetId}/reviews`
        : type === 'vendeur'
        ? `/public/vendeurs/${targetId}/reviews`
        : `/public/boutiques/${targetId}/reviews`;
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération reviews:', error);
      return this.getFallbackReviews(targetId, type);
    }
  }

  async getStatistiques(targetId: string, type: 'produit' | 'vendeur' | 'boutique'): Promise<StatistiquesReviews> {
    try {
      const endpoint = type === 'produit' 
        ? `/public/produits/${targetId}/reviews/stats`
        : type === 'vendeur'
        ? `/public/vendeurs/${targetId}/reviews/stats`
        : `/public/boutiques/${targetId}/reviews/stats`;
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return this.getFallbackStats();
    }
  }

  async ajouterReview(targetId: string, type: 'produit' | 'vendeur' | 'boutique', avis: NouvelAvis): Promise<Review> {
    try {
      const endpoint = type === 'produit' 
        ? `/client/produits/${targetId}/reviews`
        : type === 'vendeur'
        ? `/client/vendeurs/${targetId}/reviews`
        : `/client/boutiques/${targetId}/reviews`;
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, avis);
      return response.data;
    } catch (error) {
      console.error('Erreur ajout review:', error);
      // Simuler un ajout réussi
      return this.createFallbackReview(avis);
    }
  }

  async signalerReview(reviewId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/client/reviews/${reviewId}/signaler`);
    } catch (error) {
      console.error('Erreur signalement:', error);
      // Simuler succès
    }
  }

  async voterReview(reviewId: string, utile: boolean): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/client/reviews/${reviewId}/voter`, { utile });
    } catch (error) {
      console.error('Erreur vote:', error);
      // Simuler succès
    }
  }

  async repondreReview(reviewId: string, reponse: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/vendeur/reviews/${reviewId}/repondre`, { reponse });
    } catch (error) {
      console.error('Erreur réponse:', error);
      // Simuler succès
    }
  }

  // Méthodes admin pour modération
  async getReviewsAModerer(): Promise<Review[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/reviews/moderation`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération modération:', error);
      return this.getFallbackModerationReviews();
    }
  }

  async modererReview(reviewId: string, action: 'approuver' | 'rejeter', raison?: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/admin/reviews/${reviewId}/moderer`, { action, raison });
    } catch (error) {
      console.error('Erreur modération:', error);
      // Simuler succès
    }
  }

  // Fallbacks avec données simulées
  private getFallbackReviews(targetId: string, type: string): Review[] {
    return [
      {
        id: '1',
        note: 5,
        titre: 'Excellent produit !',
        commentaire: 'Très satisfait de mon achat. La qualité est au rendez-vous et la livraison a été rapide. Je recommande vivement !',
        recommande: true,
        dateCreation: '2024-01-15T10:30:00Z',
        utilisateur: {
          id: 'user1',
          nom: 'Marie Dupont'
        },
        votesUtiles: 12,
        votesInutiles: 1,
        reponseVendeur: 'Merci beaucoup pour votre retour positif ! Nous sommes ravis que vous soyez satisfaite.',
        modere: false,
        signale: false
      },
      {
        id: '2',
        note: 4,
        titre: 'Bon rapport qualité-prix',
        commentaire: 'Produit conforme à la description. Quelques petits défauts mais rien de grave. Service client réactif.',
        recommande: true,
        dateCreation: '2024-01-10T14:20:00Z',
        utilisateur: {
          id: 'user2',
          nom: 'Jean Martin'
        },
        votesUtiles: 8,
        votesInutiles: 2,
        modere: false,
        signale: false
      },
      {
        id: '3',
        note: 2,
        titre: 'Déçu de mon achat',
        commentaire: 'Le produit ne correspond pas vraiment aux photos. La qualité laisse à désirer pour ce prix.',
        recommande: false,
        dateCreation: '2024-01-05T09:15:00Z',
        utilisateur: {
          id: 'user3',
          nom: 'Sophie Bernard'
        },
        votesUtiles: 5,
        votesInutiles: 8,
        reponseVendeur: 'Nous sommes désolés de votre déception. Contactez-nous pour trouver une solution.',
        modere: false,
        signale: true
      }
    ];
  }

  private getFallbackStats(): StatistiquesReviews {
    return {
      moyenne: 4.2,
      total: 25,
      repartition: {
        5: 12,
        4: 8,
        3: 3,
        2: 1,
        1: 1
      }
    };
  }

  private createFallbackReview(avis: NouvelAvis): Review {
    return {
      id: Date.now().toString(),
      ...avis,
      dateCreation: new Date().toISOString(),
      utilisateur: {
        id: 'current-user',
        nom: 'Utilisateur Actuel'
      },
      votesUtiles: 0,
      votesInutiles: 0,
      modere: false,
      signale: false
    };
  }

  private getFallbackModerationReviews(): Review[] {
    return [
      {
        id: '4',
        note: 1,
        titre: 'Arnaque totale !',
        commentaire: 'Ce vendeur est un escroc ! N\'achetez jamais chez lui ! Produit défectueux et service client inexistant !',
        recommande: false,
        dateCreation: '2024-01-20T16:45:00Z',
        utilisateur: {
          id: 'user4',
          nom: 'Client Mécontent'
        },
        votesUtiles: 2,
        votesInutiles: 15,
        modere: false,
        signale: true
      }
    ];
  }
}

export const reviewsService = new ReviewsService();