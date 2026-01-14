/**
 * FasoMarket API Client - Intégration Frontend Complète
 * Version: 1.0.0
 * Description: Client JavaScript complet pour l'API FasoMarket
 * Compatible avec React, Vue.js, Angular, ou vanilla JavaScript
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class FasoMarketAPI {
  constructor() {
    this.baseURL = API_BASE;
    this.token = null;
  }

  // Configuration du token
  setToken(token) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fasomarket_token', token);
    }
  }

  getToken() {
    if (this.token) return this.token;
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('fasomarket_token');
    }
    return null;
  }

  removeToken() {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('fasomarket_token');
      localStorage.removeItem('fasomarket_user');
    }
  }

  // Headers pour les requêtes
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (includeAuth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    return headers;
  }

  // Méthode utilitaire pour les requêtes HTTP
  async request(endpoint, method = 'GET', data = null, includeAuth = true) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: this.getHeaders(includeAuth)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      // Gestion des erreurs d'authentification
      if (response.status === 401) {
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/connexion';
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Upload de fichiers (pour les images)
  async uploadFile(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  }

  // ==================== AUTHENTIFICATION ====================

  auth = {
    // OTP
    envoyerOtp: async (telephone, type = 'inscription') => {
      return await this.request('/envoyer-otp', 'POST', { telephone, type }, false);
    },

    verifierOtp: async (telephone, code) => {
      return await this.request('/verifier-otp', 'POST', { telephone, code }, false);
    },

    // Inscription
    registerClient: async (nom, prenom, telephone, password) => {
      const result = await this.request('/inscription-client', 'POST', {
        nom, prenom, telephone, password
      }, false);

      if (result.success && result.token) {
        this.setToken(result.token);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('fasomarket_user', JSON.stringify(result.user));
        }
      }

      return result;
    },

    registerVendor: async (data) => {
      const result = await this.request('/inscription-vendeur', 'POST', data, false);

      if (result.success && result.token) {
        this.setToken(result.token);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('fasomarket_user', JSON.stringify(result.user));
        }
      }

      return result;
    },

    // Connexion
    login: async (identifiant, password) => {
      const result = await this.request('/connexion', 'POST', {
        identifiant, password
      }, false);

      if (result.success && result.token) {
        this.setToken(result.token);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('fasomarket_user', JSON.stringify(result.user));
        }
      }

      return result;
    },

    // Déconnexion
    logout: async () => {
      const result = await this.request('/deconnexion', 'POST');
      this.removeToken();
      return result;
    },

    // Profil
    getProfile: async () => {
      return await this.request('/profil');
    },

    // Vérification de l'authentification
    isAuthenticated: () => {
      return !!this.getToken();
    },

    // Récupération des données utilisateur
    getCurrentUser: () => {
      if (typeof localStorage !== 'undefined') {
        const user = localStorage.getItem('fasomarket_user');
        return user ? JSON.parse(user) : null;
      }
      return null;
    }
  };

  // ==================== PAGE D'ACCUEIL ====================

  accueil = {
    // Statistiques générales
    getStatistiques: async () => {
      return await this.request('/accueil/statistiques', 'GET', null, false);
    },

    // Produits vedettes
    getProduitsVedettes: async () => {
      return await this.request('/accueil/produits-vedettes', 'GET', null, false);
    },

    // Nouveaux produits
    getNouveauxProduits: async () => {
      return await this.request('/accueil/nouveaux-produits', 'GET', null, false);
    },

    // Boutiques populaires
    getBoutiquesPopulaires: async () => {
      return await this.request('/accueil/boutiques-populaires', 'GET', null, false);
    },

    // Catégories populaires
    getCategoriesPopulaires: async () => {
      return await this.request('/accueil/categories-populaires', 'GET', null, false);
    },

    // Toutes les données d'accueil en une requête (RECOMMANDÉ)
    getDonneesCompletes: async () => {
      return await this.request('/accueil/donnees-completes', 'GET', null, false);
    }
  };

  // ==================== PRODUITS ====================

  products = {
    // Liste des produits avec filtres
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/produits${queryString ? `?${queryString}` : ''}`;
      return await this.request(endpoint);
    },

    // Détails d'un produit
    getById: async (id) => {
      return await this.request(`/produits/${id}`);
    },

    // Produits vedettes
    getFeatured: async () => {
      return await this.request('/produits-vedettes', 'GET', null, false);
    },

    // Recherche de produits
    search: async (query, filters = {}) => {
      const params = { q: query, ...filters };
      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/rechercher-produits?${queryString}`);
    },

    // Produits par boutique
    getByShop: async (boutiqueId) => {
      return await this.request(`/produits-boutique/${boutiqueId}`);
    },

    // Produits par catégorie
    getByCategory: async (categorieId) => {
      return await this.request(`/produits-categorie/${categorieId}`);
    },

    // CRUD pour vendeurs
    create: async (data) => {
      return await this.request('/produits', 'POST', data);
    },

    update: async (id, data) => {
      return await this.request(`/produits/${id}`, 'PUT', data);
    },

    delete: async (id) => {
      return await this.request(`/produits/${id}`, 'DELETE');
    },

    // Gestion des variantes
    getVariants: async (produitId) => {
      return await this.request(`/produits/${produitId}/variantes`);
    },

    createVariant: async (produitId, data) => {
      return await this.request(`/produits/${produitId}/variantes`, 'POST', data);
    },

    updateVariant: async (variantId, data) => {
      return await this.request(`/variantes/${variantId}`, 'PUT', data);
    },

    deleteVariant: async (variantId) => {
      return await this.request(`/variantes/${variantId}`, 'DELETE');
    }
  };

  // ==================== BOUTIQUES ====================

  shops = {
    // Liste des boutiques
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/boutiques${queryString ? `?${queryString}` : ''}`;
      return await this.request(endpoint);
    },

    // Détails d'une boutique
    getById: async (id) => {
      return await this.request(`/boutiques/${id}`);
    },

    // Boutiques publiques (sans auth)
    getPublic: async () => {
      return await this.request('/boutiques-publiques', 'GET', null, false);
    },

    // Boutique publique par ID
    getPublicById: async (id) => {
      return await this.request(`/boutique-publique/${id}`, 'GET', null, false);
    },

    // Recherche par localisation
    searchByLocation: async (ville = '', pays = '', adresse = '') => {
      const params = {};
      if (ville) params.ville = ville;
      if (pays) params.pays = pays;
      if (adresse) params.adresse = adresse;

      const queryString = new URLSearchParams(params).toString();
      return await this.request(`/boutiques-par-localisation?${queryString}`);
    },

    // Itinéraire Google Maps
    getItineraire: async (boutiqueId) => {
      return await this.request(`/boutiques/${boutiqueId}/itineraire`);
    },

    // Ouvrir Google Maps
    ouvrirGoogleMaps: (googleMapsUrl) => {
      if (typeof window !== 'undefined') {
        window.open(googleMapsUrl, '_blank');
      }
    },

    // Obtenir les directions
    obtenirDirections: (directionsUrl) => {
      if (typeof window !== 'undefined') {
        window.open(directionsUrl, '_blank');
      }
    },

    // CRUD pour vendeurs
    create: async (data) => {
      return await this.request('/boutiques', 'POST', data);
    },

    update: async (id, data) => {
      return await this.request(`/boutiques/${id}`, 'PUT', data);
    },

    delete: async (id) => {
      return await this.request(`/boutiques/${id}`, 'DELETE');
    },

    // Boutiques par vendeur
    getByVendor: async (vendeurId) => {
      return await this.request(`/boutiques-vendeur/${vendeurId}`);
    }
  };

  // ==================== CATÉGORIES ====================

  categories = {
    // Liste des catégories
    getAll: async () => {
      return await this.request('/categories', 'GET', null, false);
    },

    // CRUD admin
    create: async (data) => {
      return await this.request('/categories', 'POST', data);
    },

    update: async (id, data) => {
      return await this.request(`/categories/${id}`, 'PUT', data);
    },

    delete: async (id) => {
      return await this.request(`/categories/${id}`, 'DELETE');
    }
  };

  // ==================== PANIER ====================

  panier = {
    // Voir le panier
    voir: async () => {
      return await this.request('/panier');
    },

    // Ajouter au panier
    ajouter: async (produitId, quantite = 1, variantId = null, messageVendeur = null) => {
      return await this.request('/panier/ajouter', 'POST', {
        produit_id: produitId,
        quantite,
        variant_id: variantId,
        message_vendeur: messageVendeur
      });
    },

    // Modifier la quantité
    modifierQuantite: async (itemId, quantite) => {
      return await this.request(`/panier/items/${itemId}`, 'PATCH', { quantite });
    },

    // Supprimer un item
    supprimerItem: async (itemId) => {
      return await this.request(`/panier/items/${itemId}`, 'DELETE');
    },

    // Vider le panier
    vider: async () => {
      return await this.request('/panier/vider', 'DELETE');
    }
  };

  // ==================== FAVORIS ====================

  favoris = {
    // Liste des favoris
    lister: async () => {
      return await this.request('/favoris');
    },

    // Ajouter/retirer des favoris
    toggle: async (produitId) => {
      return await this.request(`/favoris/${produitId}`, 'POST');
    },

    ajouter: async (produitId) => {
      return await this.request(`/favoris/${produitId}`, 'POST');
    },

    supprimer: async (produitId) => {
      return await this.request(`/favoris/${produitId}`, 'DELETE');
    }
  };

  // ==================== COMMANDES ====================

  orders = {
    // Liste des commandes
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/commandes${queryString ? `?${queryString}` : ''}`;
      return await this.request(endpoint);
    },

    // Détails d'une commande
    getById: async (id) => {
      return await this.request(`/commandes/${id}`);
    },

    // Mes commandes (client)
    getMine: async () => {
      return await this.request('/mes-commandes');
    },

    // Commandes du vendeur
    getVendorOrders: async () => {
      return await this.request('/commandes-vendeur');
    },

    // Créer une commande
    create: async (data) => {
      return await this.request('/passer-commande', 'POST', data);
    },

    // Changer le statut (vendeur)
    updateStatus: async (id, statut) => {
      return await this.request(`/commandes/${id}/statut`, 'PUT', { statut });
    }
  };

  // ==================== IMAGES ====================

  images = {
    // Upload d'images
    upload: async (type, id, formData) => {
      const endpoint = `/${type}/${id}/images`;
      return await this.uploadFile(endpoint, formData);
    },

    // Supprimer une image
    delete: async (imageId) => {
      return await this.request(`/images/${imageId}`, 'DELETE');
    },

    // Réorganiser les images
    updateOrder: async (imageId, order) => {
      return await this.request(`/images/${imageId}/order`, 'PATCH', { order });
    }
  };

  // ==================== CONVERSATIONS ====================

  conversations = {
    // Liste des conversations
    getAll: async () => {
      return await this.request('/conversations');
    },

    // Créer une conversation
    create: async (vendeurId, produitId, sujet, message) => {
      return await this.request('/conversations', 'POST', {
        vendeur_id: vendeurId,
        produit_id: produitId,
        sujet,
        message
      });
    },

    // Messages d'une conversation
    getMessages: async (conversationId) => {
      return await this.request(`/conversations/${conversationId}`);
    },

    // Envoyer un message
    sendMessage: async (conversationId, contenu, piecesJointes = null) => {
      return await this.request(`/conversations/${conversationId}/messages`, 'POST', {
        contenu,
        pieces_jointes: piecesJointes
      });
    },

    // Marquer comme lu
    markAsRead: async (messageId) => {
      return await this.request(`/messages/${messageId}/marquer-lu`, 'PATCH');
    }
  };

  // ==================== VENDEUR ====================

  vendor = {
    // Dashboard complet
    getDashboard: async () => {
      return await this.request('/dashboard-vendeur');
    },

    // Statistiques
    getStats: async () => {
      return await this.request('/vendor/stats');
    },

    // Commandes récentes
    getRecentOrders: async () => {
      return await this.request('/vendor/recent-orders');
    },

    // Produits populaires
    getTopProducts: async () => {
      return await this.request('/vendor/top-products');
    },

    // Toutes les commandes
    getOrders: async () => {
      return await this.request('/vendor/orders');
    },

    // Mettre à jour le statut d'une commande
    updateOrderStatus: async (orderId, statut) => {
      return await this.request(`/vendor/orders/${orderId}/status`, 'PUT', { statut });
    },

    // Clients du vendeur
    getClients: async () => {
      return await this.request('/vendor/clients');
    },

    // Notifications
    getNotifications: async () => {
      return await this.request('/notifications');
    }
  };

  // ==================== AVIS ====================

  reviews = {
    // Liste des avis pour un produit
    getByProduct: async (produitId) => {
      return await this.request(`/produits/${produitId}/avis`);
    },

    // Créer un avis
    create: async (produitId, note, commentaire, images = []) => {
      return await this.request('/avis', 'POST', {
        produit_id: produitId,
        note,
        commentaire,
        images
      });
    },

    // Avis par boutique
    getByShop: async (boutiqueId) => {
      return await this.request(`/boutiques/${boutiqueId}/avis`);
    }
  };

  // ==================== CODES PROMO ====================

  promoCodes = {
    // Liste des codes promo actifs
    getAll: async () => {
      return await this.request('/codes-promo', 'GET', null, false);
    },

    // Valider un code promo
    validate: async (code, montant) => {
      return await this.request('/valider-code-promo', 'POST', { code, montant });
    },

    // CRUD admin
    create: async (data) => {
      return await this.request('/codes-promo', 'POST', data);
    },

    update: async (id, data) => {
      return await this.request(`/codes-promo/${id}`, 'PUT', data);
    },

    delete: async (id) => {
      return await this.request(`/codes-promo/${id}`, 'DELETE');
    }
  };

  // ==================== STATISTIQUES ====================

  stats = {
    // Statistiques générales
    getGeneral: async () => {
      return await this.request('/stats/general', 'GET', null, false);
    },

    // Statistiques vendeur
    getVendor: async () => {
      return await this.request('/stats/vendor');
    },

    // Statistiques produit
    getProduct: async (produitId) => {
      return await this.request(`/stats/produit/${produitId}`);
    }
  };

  // ==================== UTILITAIRES ====================

  utils = {
    // Formatage des prix
    formatPrice: (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
      }).format(price);
    },

    // Formatage des dates
    formatDate: (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    // Calcul du temps écoulé
    timeAgo: (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);

      const intervals = [
        { label: 'an', seconds: 31536000 },
        { label: 'mois', seconds: 2592000 },
        { label: 'jour', seconds: 86400 },
        { label: 'heure', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'seconde', seconds: 1 }
      ];

      for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
          return `il y a ${count} ${interval.label}${count > 1 ? 's' : ''}`;
        }
      }

      return 'à l\'instant';
    },

    // Validation des formulaires
    validateEmail: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validatePhone: (phone) => {
      const re = /^(\+226|00226)?[0-9]{8}$/;
      return re.test(phone.replace(/\s/g, ''));
    },

    // Gestion du stockage local
    setUserData: (user) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('fasomarket_user', JSON.stringify(user));
      }
    },

    getUserData: () => {
      if (typeof localStorage !== 'undefined') {
        const user = localStorage.getItem('fasomarket_user');
        return user ? JSON.parse(user) : null;
      }
      return null;
    },

    clearUserData: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('fasomarket_user');
      }
    }
  };
}

// Instance globale pour utilisation facile
const fasoMarketAPI = new FasoMarketAPI();

// Export pour ES6 modules
export default fasoMarketAPI;

// Export de la classe pour instanciation personnalisée
export { FasoMarketAPI };

// Support pour CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = fasoMarketAPI;
  module.exports.FasoMarketAPI = FasoMarketAPI;
}

// Support pour AMD
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return fasoMarketAPI;
  });
}
