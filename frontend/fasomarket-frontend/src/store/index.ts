import { create } from 'zustand';
import type { User, PanierItem } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (telephone: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface PanierStore {
  items: PanierItem[];
  setItems: (items: PanierItem[]) => void;
  addItem: (item: PanierItem) => void;
  removeItem: (itemId: string) => void;
  clearPanier: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (telephone: string, password: string) => {
    try {
      const { authService } = await import('../services/api');
      console.log('Tentative de connexion avec:', { telephone, motDePasse: password });
      
      const response = await authService.login(telephone, password);
      console.log('Réponse complète de connexion:', response);
      console.log('Data de la réponse:', response.data);
      
      // Vérifier la structure de la réponse
      if (!response.data) {
        throw new Error('Aucune donnée dans la réponse');
      }
      
      const responseData = response.data;
      
      // Essayer différentes structures possibles
      let user, token;
      
      if (responseData.user && responseData.token) {
        user = responseData.user;
        token = responseData.token;
      } else if (responseData.utilisateur && responseData.token) {
        user = responseData.utilisateur;
        token = responseData.token;
      } else if (responseData.userId && responseData.role && responseData.token) {
        // Structure actuelle de l'API : userId, nomComplet, telephone, email, role, token
        user = {
          id: responseData.userId,
          nomComplet: responseData.nomComplet,
          telephone: responseData.telephone,
          email: responseData.email,
          role: responseData.role,
          estActif: responseData.estActif,
          estVerifie: responseData.estVerifie
        };
        token = responseData.token;
      } else {
        console.error('Structure de réponse inattendue:', responseData);
        throw new Error('Structure de réponse invalide');
      }
      
      if (user && user.id && token) {
        localStorage.setItem('userId', user.id);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return user;
      }
      
      throw new Error('Données utilisateur ou token manquants');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      console.error('Détails erreur:', error.response?.data);
      
      // Nettoyer le localStorage en cas d'erreur
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
      
      if (error.response?.status === 400) {
        throw new Error('Identifiants incorrects');
      } else if (error.response?.status === 403) {
        throw new Error('Accès refusé');
      } else {
        throw new Error(error.message || 'Erreur de connexion. Vérifiez votre connexion internet.');
      }
    }
  },
  
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));

export const usePanierStore = create<PanierStore>((set, get) => ({
  items: [],
  
  setItems: (items: PanierItem[]) => set({ items }),
  
  addItem: (item: PanierItem) => {
    const items = get().items;
    const existingItem = items.find(i => i.produit.id === item.produit.id);
    
    if (existingItem) {
      set({
        items: items.map(i =>
          i.produit.id === item.produit.id
            ? { ...i, quantite: i.quantite + item.quantite }
            : i
        )
      });
    } else {
      set({ items: [...items, item] });
    }
  },
  
  removeItem: (itemId: string) => {
    set({ items: get().items.filter(item => item.id !== itemId) });
  },
  
  clearPanier: () => set({ items: [] }),
  
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantite, 0),
  
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.produit.prix * item.quantite), 0),
}));

// Initialiser l'état d'authentification depuis localStorage
const initializeAuth = () => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        // Initialiser directement l'état sans appeler login
        useAuthStore.setState({ user, isAuthenticated: true });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        useAuthStore.getState().logout();
      }
    }
  }
};

// Initialiser automatiquement
initializeAuth();
