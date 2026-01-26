import { useContext } from 'react';
import { PanierContext, type PanierContextType } from '../contexts/PanierContextDef';

export const usePanier = (): PanierContextType => {
  const context = useContext(PanierContext);
  if (!context) {
    throw new Error('usePanier must be used within a PanierProvider');
  }
  return context;
};