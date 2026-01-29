// services/variantesAssistantService.ts
export interface SuggestionVariante {
  champ: string;
  label: string;
  type: 'select' | 'input' | 'number';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  description?: string;
}

export interface TemplateVariantes {
  categorie: string;
  suggestions: SuggestionVariante[];
  variantesPredefines: VarianteTemplate[];
}

export interface VarianteTemplate {
  nom: string;
  valeurs: Record<string, any>;
  prixAjustement: number;
  description?: string;
}

export const variantesAssistantService = {
  // Obtenir les suggestions pour une catégorie
  getSuggestions: (categorieId: string): Promise<TemplateVariantes> => {
    return fetch(`/api/variantes/suggestions/${categorieId}`)
      .then(res => res.json());
  },

  // Générer des variantes automatiquement
  genererVariantesAuto: (categorieId: string, options: Record<string, string[]>) => {
    return fetch(`/api/variantes/generer-auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categorieId, options })
    }).then(res => res.json());
  },

  // Obtenir des templates populaires
  getTemplatesPopulaires: (categorieId: string) => {
    return fetch(`/api/variantes/templates/${categorieId}`)
      .then(res => res.json());
  }
};

// Templates prédéfinis par catégorie
export const TEMPLATES_VARIANTES = {
  'Mode': {
    suggestions: [
      { champ: 'couleur', label: 'Couleur', type: 'select', options: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Rose', 'Gris'], required: true },
      { champ: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
      { champ: 'genre', label: 'Genre', type: 'select', options: ['Homme', 'Femme', 'Unisexe'], required: true },
      { champ: 'saison', label: 'Saison', type: 'select', options: ['Été', 'Hiver', 'Mi-saison', 'Toute saison'] },
      { champ: 'materiau', label: 'Matériau', type: 'select', options: ['Coton', 'Polyester', 'Lin', 'Soie', 'Laine', 'Denim'] }
    ],
    variantesPredefines: [
      { nom: 'Basique Noir-Blanc', valeurs: { couleur: 'Noir', taille: 'M', genre: 'Unisexe' }, prixAjustement: 0 },
      { nom: 'Basique Noir-Blanc', valeurs: { couleur: 'Blanc', taille: 'M', genre: 'Unisexe' }, prixAjustement: 0 },
      { nom: 'Coloré Premium', valeurs: { couleur: 'Rouge', taille: 'M', genre: 'Unisexe' }, prixAjustement: 2000 }
    ]
  },
  
  'Electronique': {
    suggestions: [
      { champ: 'couleur', label: 'Couleur', type: 'select', options: ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge'], required: true },
      { champ: 'capacite', label: 'Capacité', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], required: true },
      { champ: 'modele', label: 'Modèle', type: 'select', options: ['Standard', 'Pro', 'Max', 'Mini'] },
      { champ: 'puissance', label: 'Puissance', type: 'input', placeholder: 'Ex: 65W, 100W' }
    ],
    variantesPredefines: [
      { nom: 'Entrée de gamme', valeurs: { couleur: 'Noir', capacite: '64GB', modele: 'Standard' }, prixAjustement: 0 },
      { nom: 'Milieu de gamme', valeurs: { couleur: 'Noir', capacite: '128GB', modele: 'Standard' }, prixAjustement: 25000 },
      { nom: 'Haut de gamme', valeurs: { couleur: 'Blanc', capacite: '256GB', modele: 'Pro' }, prixAjustement: 75000 }
    ]
  },

  'Cosmétiques': {
    suggestions: [
      { champ: 'parfum', label: 'Parfum', type: 'select', options: ['Vanille', 'Rose', 'Lavande', 'Citrus', 'Menthe', 'Sans parfum'], required: true },
      { champ: 'finition', label: 'Finition', type: 'select', options: ['Mat', 'Brillant', 'Satiné', 'Nacré'], required: true },
      { champ: 'genre', label: 'Genre', type: 'select', options: ['Homme', 'Femme', 'Unisexe'], required: true },
      { champ: 'couleur', label: 'Teinte', type: 'input', placeholder: 'Ex: Beige clair, Rouge cerise' }
    ],
    variantesPredefines: [
      { nom: 'Classique Femme', valeurs: { parfum: 'Rose', finition: 'Mat', genre: 'Femme' }, prixAjustement: 0 },
      { nom: 'Premium Brillant', valeurs: { parfum: 'Vanille', finition: 'Brillant', genre: 'Femme' }, prixAjustement: 3000 },
      { nom: 'Unisexe Neutre', valeurs: { parfum: 'Sans parfum', finition: 'Mat', genre: 'Unisexe' }, prixAjustement: -1000 }
    ]
  },

  'Alimentaire': {
    suggestions: [
      { champ: 'poids', label: 'Poids', type: 'select', options: ['250g', '500g', '1kg', '2kg', '5kg'], required: true },
      { champ: 'modele', label: 'Qualité', type: 'select', options: ['Standard', 'Bio', 'Premium', 'Artisanal'], required: true },
      { champ: 'origine', label: 'Origine', type: 'input', placeholder: 'Ex: Burkina Faso, Local' }
    ],
    variantesPredefines: [
      { nom: 'Standard 500g', valeurs: { poids: 0.5, modele: 'Standard' }, prixAjustement: 0 },
      { nom: 'Standard 1kg', valeurs: { poids: 1.0, modele: 'Standard' }, prixAjustement: 1500 },
      { nom: 'Bio 500g', valeurs: { poids: 0.5, modele: 'Bio' }, prixAjustement: 2000 },
      { nom: 'Bio 1kg', valeurs: { poids: 1.0, modele: 'Bio' }, prixAjustement: 3500 }
    ]
  },

  'Maison': {
    suggestions: [
      { champ: 'couleur', label: 'Couleur', type: 'select', options: ['Blanc', 'Noir', 'Beige', 'Gris', 'Marron', 'Bleu'], required: true },
      { champ: 'materiau', label: 'Matériau', type: 'select', options: ['Bois', 'Métal', 'Plastique', 'Verre', 'Tissu', 'Céramique'], required: true },
      { champ: 'finition', label: 'Finition', type: 'select', options: ['Mat', 'Brillant', 'Texturé', 'Lisse', 'Antique'] },
      { champ: 'dimensions', label: 'Dimensions', type: 'input', placeholder: 'Ex: 120x80x45cm' }
    ],
    variantesPredefines: [
      { nom: 'Bois Naturel', valeurs: { couleur: 'Marron', materiau: 'Bois', finition: 'Mat' }, prixAjustement: 15000 },
      { nom: 'Métal Moderne', valeurs: { couleur: 'Noir', materiau: 'Métal', finition: 'Mat' }, prixAjustement: 8000 },
      { nom: 'Blanc Classique', valeurs: { couleur: 'Blanc', materiau: 'Bois', finition: 'Lisse' }, prixAjustement: 12000 }
    ]
  }
};