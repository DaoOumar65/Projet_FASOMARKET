import { create } from 'zustand';
import { vendorService } from '../services/api';
import type { StatutCompteVendeur, StatutBoutique, Boutique, User } from '../types';

interface VendeurState {
  user: User | null;
  boutique: Boutique | null;
  statutCompte: StatutCompteVendeur | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkStatutCompte: () => Promise<void>;
  fetchBoutique: () => Promise<void>;
  creerBoutique: (data: any) => Promise<any>;
  soumettreValidation: (boutiqueId: string) => Promise<any>;
  clearError: () => void;
}

export const useVendeurStore = create<VendeurState>((set, get) => ({
  user: null,
  boutique: null,
  statutCompte: null,
  isLoading: false,
  error: null,

  checkStatutCompte: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await vendorService.getStatutCompte();
      set({ 
        statutCompte: response.data.statutCompte,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: 'Erreur lors de la vérification du statut',
        isLoading: false 
      });
    }
  },

  fetchBoutique: async () => {
    try {
      const response = await vendorService.getBoutique();
      set({ boutique: response.data });
    } catch (error) {
      set({ boutique: null });
    }
  },

  creerBoutique: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vendorService.creerBoutique(data);
      set({ 
        boutique: response.data,
        isLoading: false 
      });
      return response.data;
    } catch (error: any) {
      set({ 
        error: 'Erreur lors de la création',
        isLoading: false 
      });
      throw error;
    }
  },

  soumettreValidation: async (boutiqueId: string) => {
    try {
      const response = await vendorService.soumettreValidation(boutiqueId);
      set({ boutique: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));