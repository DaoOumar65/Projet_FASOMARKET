// Types étendus pour toutes les variantes de produits
export interface ProduitVarianteComplete {
  id: number;
  produitId: string;
  
  // Variantes de base
  couleur?: string;
  taille?: string;
  modele?: string;
  
  // Variantes étendues
  poids?: number;
  dimensions?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  puissance?: string;
  parfum?: string;
  ageCible?: string;
  genre?: string;
  saison?: string;
  
  // Données produit (publiques)
  prixAjustement: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface VarianteOptions {
  couleurs?: string[];
  tailles?: string[];
  modeles?: string[];
  materiaux?: string[];
  finitions?: string[];
  capacites?: string[];
  parfums?: string[];
  genres?: string[];
  saisons?: string[];
}

export interface VarianteSelection {
  couleur?: string;
  taille?: string;
  modele?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  parfum?: string;
  genre?: string;
  saison?: string;
}

// Variantes spécialisées par catégorie
export interface VariantesVetements {
  couleur: string;
  taille: string;
  genre: 'Homme' | 'Femme' | 'Unisexe';
  saison: 'Été' | 'Hiver' | 'Mi-saison';
  ageCible?: string;
}

export interface VariantesElectronique {
  couleur: string;
  capacite: string;
  modele: string;
  puissance?: string;
}

export interface VariantesCosmetiques {
  parfum: string;
  finition: 'Mat' | 'Brillant' | 'Satiné';
  genre: 'Homme' | 'Femme' | 'Unisexe';
}

export interface VariantesAlimentaire {
  poids: number;
  modele: 'Bio' | 'Standard' | 'Premium';
}

export interface VariantesMaison {
  couleur: string;
  materiau: string;
  finition: string;
  dimensions?: string;
}