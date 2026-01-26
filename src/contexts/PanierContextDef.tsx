import { createContext } from 'react';
import type { PanierItem } from '../types';

export interface PanierContextType {
  panierItems: PanierItem[];
  total: number;
  loading: boolean;
  ajouterAuPanier: (produitId: string, quantite: number, varianteId?: string) => Promise<void>;
  supprimerDuPanier: (itemId: string) => Promise<void>;
  modifierQuantite: (itemId: string, nouvelleQuantite: number) => Promise<void>;
  chargerPanier: () => Promise<void>;
  viderPanier: () => Promise<void>;
  synchroniserAvecBackend: () => Promise<boolean>;
}

export const PanierContext = createContext<PanierContextType | undefined>(undefined);