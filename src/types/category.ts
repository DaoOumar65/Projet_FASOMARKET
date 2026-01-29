// Types harmonisés pour les catégories
export interface Category {
  id: string;
  nom: string;  // Harmonisé avec l'existant
  description: string;
  icone: string;  // Harmonisé avec l'existant
  isActive: boolean;
  variantConfig?: VariantConfig;
}

// Alias pour compatibilité
export type Categorie = Category;

export interface VariantConfig {
  variants: VariantItem[];
}

export interface VariantItem {
  couleur?: string;
  taille?: string;
  modele?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  parfum?: string;
  genre?: string;
  saison?: string;
  poids?: string;
  prixAjustement: number;
}