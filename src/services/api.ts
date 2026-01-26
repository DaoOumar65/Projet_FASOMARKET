import axios from 'axios';
import type { AuthResponse, User, Boutique, Produit, Commande, PanierItem, Notification, Categorie, Adresse, Favori, CommandeResponse } from '../types';

const API_BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter l'ID utilisateur et le token aux requêtes authentifiées
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  // Ajouter les headers pour toutes les requêtes sauf les endpoints publics
  if (!config.url?.includes('/api/public/')) {
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si erreur 401 ou 403, nettoyer l'authentification SEULEMENT si ce n'est pas un endpoint admin en test
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Ne pas nettoyer automatiquement pour les endpoints admin - laisser le composant gérer
      if (!error.config?.url?.includes('/api/admin/')) {
        // Seulement si ce n'est pas un endpoint d'authentification
        if (!error.config?.url?.includes('/api/auth/')) {
          console.log('Nettoyage automatique de l\'authentification pour:', error.config?.url);
          localStorage.removeItem('userId');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Rediriger vers la page de connexion si nécessaire
          if (window.location.pathname !== '/connexion' && !window.location.pathname.includes('/inscription')) {
            window.location.href = '/connexion';
          }
        }
      } else {
        console.log('Erreur 403 sur endpoint admin - pas de nettoyage automatique');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (telephone: string, motDePasse: string) =>
    api.post<AuthResponse>('/api/auth/connexion', { telephone, motDePasse }),
  
  registerClient: (data: { nomComplet: string; telephone: string; motDePasse: string; role?: string }) =>
    api.post('/api/auth/inscription-client', data),
  
  registerVendor: (data: { nomComplet: string; telephone: string; email: string; motDePasse: string }) =>
    api.post('/api/auth/inscription-vendeur', data),
  
  changePassword: (ancienMotDePasse: string, nouveauMotDePasse: string) =>
    api.put('/api/auth/changer-mot-de-passe', { ancienMotDePasse, nouveauMotDePasse }),
};

export const publicService = {
  getAccueil: () => api.get('/api/public/accueil'),
  recherche: (q: string, type?: string) => api.get(`/api/public/recherche?q=${q}${type ? `&type=${type}` : ''}`),
  getCategories: () => api.get<Categorie[]>('/api/public/categories'),
  getCategorieVitrine: (id: string) => api.get(`/api/public/categories/${id}/vitrine`),
  getCategorieProduits: (id: string, page = 0, size = 20) => api.get<Produit[]>(`/api/public/categories/${id}/produits?page=${page}&size=${size}`),
  getBoutiques: (page = 0, size = 20) => api.get<Boutique[]>(`/api/public/boutiques?page=${page}&size=${size}`),
  getBoutique: (id: string) => api.get<Boutique>(`/api/public/boutiques/${id}`),
  getBoutiqueProduits: (id: string) => api.get<Produit[]>(`/api/public/boutiques/${id}/produits`),
  getProduit: (id: string) => api.get<Produit>(`/api/public/produits/${id}`),
  getProduitVariantes: (id: string) => api.get(`/api/public/produits/${id}/variantes`),
  getProduits: (page = 0, size = 20, filters?: any) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (filters?.categorie) params.append('categorie', filters.categorie);
    if (filters?.prixMin) params.append('prixMin', filters.prixMin.toString());
    if (filters?.prixMax) params.append('prixMax', filters.prixMax.toString());
    if (filters?.recherche) params.append('q', filters.recherche);
    return api.get<Produit[]>(`/api/public/produits?${params.toString()}`);
  },
};

export const clientService = {
  getDashboard: () => api.get('/api/client/dashboard'),
  getProfil: () => api.get<User>('/api/client/profil'),
  updateProfil: (data: Partial<User>) => api.put('/api/client/profil', data),
  
  // Panier avec variantes
  ajouterAuPanier: (produitId: string, quantite: number, varianteId?: string) => 
    api.post('/api/client/panier/ajouter', { produitId, quantite, varianteId }),
  getPanier: () => api.get<PanierItem[]>('/api/client/panier'),
  supprimerDuPanier: (itemId: string) => api.delete(`/api/client/panier/${itemId}`),
  viderPanier: () => api.delete('/api/client/panier/vider'),
  
  // Commandes
  creerCommande: (data: { adresseLivraison: string; methodePaiement?: string; numeroTelephone: string; needsDelivery?: boolean }) =>
    api.post<CommandeResponse>('/api/client/commandes/creer', data),
  getHistoriqueCommandes: () => api.get<Commande[]>('/api/client/historique-commandes'),
  getCommande: (id: string) => api.get<Commande>(`/api/client/commandes/${id}`),
  
  // Favoris
  getFavoris: () => api.get('/api/client/favoris'),
  ajouterAuxFavoris: (produitId: string) => api.post('/api/client/favoris/ajouter', { produitId }),
  supprimerDesFavoris: (produitId: string) => api.delete(`/api/client/favoris/${produitId}`),
  
  // Adresses
  getAdresses: () => api.get('/api/client/adresses'),
  ajouterAdresse: (data: { nom: string; adresse: string; telephone: string; parDefaut?: boolean }) =>
    api.post('/api/client/adresses/ajouter', data),
  updateAdresse: (id: string, data: { nom: string; adresse: string; telephone: string; parDefaut?: boolean }) =>
    api.put(`/api/client/adresses/${id}`, data),
  supprimerAdresse: (id: string) => api.delete(`/api/client/adresses/${id}`),
  definirAdresseParDefaut: (id: string) => api.put(`/api/client/adresses/${id}/defaut`),
  
  // Notifications
  getNotifications: () => api.get<Notification[]>('/api/client/notifications'),
  getNotificationCount: () => api.get('/api/client/notifications/compteur'),
  marquerNotificationLue: (id: string) => api.put(`/api/client/notifications/${id}/lue`),
};

export const vendorService = {
  getDashboard: () => api.get('/api/vendeur/dashboard'),
  getAnalytics: () => api.get('/api/vendeur/analytics'),
  getGuide: () => api.get('/api/vendeur/guide'),
  
  // Statut compte
  getStatutCompte: () => api.get('/api/vendeur/statut-compte'),
  
  // Boutique
  creerBoutique: (data: any) => {
    const formData = new FormData();
    
    // Ajouter tous les champs sauf le fichier
    Object.keys(data).forEach(key => {
      if (key !== 'fichierIfu') {
        formData.append(key, data[key]);
        console.log(`FormData: ${key} = ${data[key]}`);
      }
    });
    
    // Ajouter le fichier séparément
    if (data.fichierIfu) {
      formData.append('fichierIfu', data.fichierIfu);
      console.log('FormData: fichierIfu =', data.fichierIfu.name);
    }
    
    return api.post('/api/vendeur/boutiques/creer', formData);
  },
  
  creerBoutiqueWithPath: (data: any) => api.post('/api/vendeur/boutiques/creer', data),
  getBoutique: () => api.get('/api/vendeur/boutiques'),
  updateBoutique: (id: string, data: any) => api.put(`/api/vendeur/boutiques/${id}`, data),
  soumettreValidation: (boutiqueId: string) => api.post(`/api/vendeur/boutiques/${boutiqueId}/soumettre`),
  getCategoryFormFields: (categoryId: string) => api.get(`/api/vendeur/categories/${categoryId}/form-fields`),
  updateLivraison: (data: any) => api.put('/api/vendeur/boutiques/livraison', data),
  
  // Produits avec variantes
  creerProduit: (data: any) => api.post('/api/vendeur/produits/creer', data),
  getProduits: () => api.get('/api/vendeur/produits'),
  getProduit: (id: string) => api.get(`/api/vendeur/produits/${id}`),
  getProduitVariantes: (id: string) => api.get(`/api/vendeur/produits/${id}/variantes`),
  genererVariantes: (produitId: string) => api.post(`/api/vendeur/produits/${produitId}/variantes/generer`),
  creerVariante: (produitId: string, data: any) => api.post(`/api/vendeur/produits/${produitId}/variantes`, data),
  updateVariante: (produitId: string, varianteId: string, data: any) => api.put(`/api/vendeur/produits/${produitId}/variantes/${varianteId}`, data),
  supprimerVariante: (produitId: string, varianteId: string) => api.delete(`/api/vendeur/produits/${produitId}/variantes/${varianteId}`),
  updateProduit: (id: string, data: any) => api.put(`/api/vendeur/produits/${id}`, data),
  supprimerProduit: (id: string) => api.delete(`/api/vendeur/produits/${id}`),
  getGestionStock: () => api.get('/api/vendeur/gestion-stock'),
  updateStock: (produitId: string, data: { quantiteStock: number; seuilAlerte: number }) =>
    api.put(`/api/vendeur/produits/${produitId}/stock`, data),
  
  // Commandes
  getCommandes: () => api.get('/api/vendeur/commandes'),
  updateCommandeStatut: (id: string, statut: string) => 
    api.put(`/api/vendeur/commandes/${id}/statut`, { statut }),
  decrementerStock: (commandeId: string) =>
    api.put(`/api/vendeur/commandes/${commandeId}/decrementer-stock`),
    
  // Profil et paramètres
  updateProfil: (data: any) => api.put('/api/vendeur/profil', data),
  updateNotificationSettings: (settings: any) => api.put('/api/vendeur/notifications/settings', settings),
    
  // Notifications
  getNotifications: () => api.get('/api/vendeur/notifications'),
};

export const adminService = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  
  // Utilisateurs
  getUtilisateurs: (role?: string, page = 0, size = 20) => 
    api.get(`/api/admin/utilisateurs?${role ? `role=${role}&` : ''}page=${page}&size=${size}`),
  bloquerUtilisateur: (userId: string) => api.post(`/api/admin/utilisateurs/${userId}/bloquer`),
  debloquerUtilisateur: (userId: string) => api.post(`/api/admin/utilisateurs/${userId}/debloquer`),
  getUtilisateurDetails: (userId: string) => api.get(`/api/admin/utilisateurs/${userId}/details`),
  
  // Validations
  getValidations: () => api.get('/api/admin/validations'),
  getValidationsVendeurs: () => api.get('/api/admin/validations/vendeurs'),
  getValidationsBoutiques: () => api.get('/api/admin/validations/boutiques'),
  validerVendeur: (vendorId: string, statut: string, raison?: string) => {
    const params = new URLSearchParams();
    params.append('statut', statut);
    if (raison) params.append('raison', raison);
    return api.put(`/api/admin/vendeurs/${vendorId}/valider?${params.toString()}`);
  },
  saveCnibVendeur: (vendorId: string, cnib: string) =>
    api.put(`/api/admin/vendeurs/${vendorId}/cnib`, { cnib }),
  
  // Boutiques
  getBoutiques: () => api.get('/api/admin/boutiques'),
  getBoutiqueDetails: (boutiqueId: string) => api.get(`/api/admin/boutiques/${boutiqueId}/details`),
  validerBoutique: (boutiqueId: string, statut: string, raison?: string) => {
    const params = new URLSearchParams();
    params.append('statut', statut);
    if (raison) params.append('raison', raison);
    return api.put(`/api/admin/boutiques/${boutiqueId}/valider?${params.toString()}`);
  },
  updateBoutiqueStatut: (id: string, statut: string) =>
    api.put(`/api/admin/boutiques/${id}/statut`, { statut }),
  
  // Produits
  getProduits: (page = 0, size = 20) => api.get(`/api/admin/produits?page=${page}&size=${size}`),
  getProduitDetails: (produitId: string) => api.get(`/api/admin/produits/${produitId}/details`),
  updateProduitStatut: (produitId: string, statut: string) =>
    api.put(`/api/admin/produits/${produitId}/statut`, { statut }),
  supprimerProduit: (produitId: string) => api.delete(`/api/admin/produits/${produitId}`),
  
  // Commandes
  getCommandes: () => api.get('/api/admin/commandes'),
  getCommandeDetails: (commandeId: string) => api.get(`/api/admin/commandes/${commandeId}/details`),
  updateCommandeStatut: (id: string, statut: string) =>
    api.put(`/api/admin/commandes/${id}/statut`, { statut }),
  
  // Catégories
  creerCategorie: (data: { nom: string; description: string; icone: string }) =>
    api.post('/api/admin/categories/creer', data),
  getCategories: () => api.get('/api/admin/categories'),
  updateCategorie: (id: string, data: { nom: string; description: string; icone: string }) =>
    api.put(`/api/admin/categories/${id}`, data),
  supprimerCategorie: (id: string) => api.delete(`/api/admin/categories/${id}`),
  
  // Notifications et système
  diffuserNotification: (titre: string, message: string) =>
    api.post('/api/admin/notifications/diffuser', { titre, message }),
  getNotificationsHistorique: () => api.get('/api/admin/notifications/historique'),
  getStatistiquesSysteme: () => api.get('/api/admin/statistiques/revenus'),
  
  // Badges de notification
  getBadges: () => api.get('/api/admin/badges'),
};

export { api };
export default api;