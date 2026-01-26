// Types d'utilisateur
export interface User {
  id: string;
  nomComplet: string;
  telephone: string;
  email: string;
  role: 'CLIENT' | 'VENDOR' | 'ADMIN';
  
  // Champs spécifiques vendeur
  statutCompte?: StatutCompteVendeur;
  documentIdentite?: string;
  dateValidationCompte?: string;
  raisonRefus?: string;
}

// Enums pour le système de validation
export const StatutCompteVendeur = {
  EN_ATTENTE_VALIDATION: 'EN_ATTENTE_VALIDATION',
  COMPTE_VALIDE: 'COMPTE_VALIDE',
  SUSPENDU: 'SUSPENDU',
  REFUSE: 'REFUSE'
} as const;

export type StatutCompteVendeur = typeof StatutCompteVendeur[keyof typeof StatutCompteVendeur];

export const StatutBoutique = {
  BROUILLON: 'BROUILLON',
  EN_ATTENTE_APPROBATION: 'EN_ATTENTE_APPROBATION',
  ACTIVE: 'ACTIVE',
  REJETEE: 'REJETEE',
  SUSPENDUE: 'SUSPENDUE'
} as const;

export type StatutBoutique = typeof StatutBoutique[keyof typeof StatutBoutique];

// Réponse d'authentification
export interface AuthResponse {
  token: string;
  utilisateur: User;
}

// Boutique
export interface Boutique {
  id: string;
  vendeurId?: string;
  nom: string;
  description: string;
  telephone?: string;
  adresse: string;
  email?: string;
  categorie: string;
  livraison: boolean;
  fraisLivraison: number;
  
  // Nouveaux champs de l'API
  note?: number;
  nombreAvis?: number;
  logoUrl?: string;
  bannerUrl?: string;
  
  // Documents de validation
  registreCommerceUrl?: string;
  patenteUrl?: string;
  photosBoutique?: string[];
  
  // Statut et validation
  statut: StatutBoutique;
  dateCreation?: string;
  dateSoumission?: string;
  dateValidation?: string;
  raisonRejet?: string;
  valideParAdminId?: string;
}

// Produit
export interface ProduitDetails {
  taille?: string[];
  couleur?: string[];
  marque?: string;
  matiere?: string;
  poids?: string;
  dimensions?: string;
  garantie?: string;
  origine?: string;
  [key: string]: any; // Pour d'autres attributs dynamiques
}

export interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  images: string[];
  boutique: Boutique;
  disponible: boolean;
  quantiteStock: number;
  categorie: string;
  details?: ProduitDetails;
  // Champs legacy pour compatibilité
  poids?: number;
  dimensions?: string;
}

// Panier
export interface CommandeResponse {
  id: string;
  numeroCommande: string;
  statut: string;
  total: number;
  message: string;
}

export interface ProduitVariante {
  id: string;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
}

export interface PanierItem {
  id: string;
  produit: {
    id: string;
    nom: string;
    prix: number;
    images: string[];
    boutique?: {
      id: string;
      nom: string;
      adresse: string;
      livraison: boolean;
      fraisLivraison: number;
    };
  };
  quantite: number;
  varianteId?: string;
  variante?: ProduitVariante;
  couleurSelectionnee?: string;
  tailleSelectionnee?: string;
  modeleSelectionne?: string;
}

// Commande
export interface CommandeItem {
  id: string;
  produit: Produit;
  quantite: number;
  prix: number;
}

export interface Commande {
  id: string;
  statut: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  adresseLivraison: string;
  methodePaiement: 'MOBILE_MONEY';
  numeroTelephone: string;
  total: number;
  dateCreation: string;
  items: CommandeItem[];
}

// Notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'SYSTEM';
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

// Adresse client
export interface Adresse {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  parDefaut: boolean;
  dateCreation: string;
}

// Favori client
export interface Favori {
  id: string;
  produit: Produit;
  dateAjout: string;
}

// Catégorie
export interface Categorie {
  id: string;
  nom: string;
  description: string;
  icone: string;
}

// Types pour les formulaires de connexion/inscription
export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  nomComplet: string;
  telephone: string;
  email: string;
  motDePasse: string;
  role?: 'CLIENT' | 'VENDOR';
}

// Types pour la création de boutique
export interface CreateBoutiqueData {
  nom: string;
  description: string;
  telephone: string;
  adresse: string;
  email: string;
  categorie: string;
  livraison: boolean;
  fraisLivraison?: number;
}

// Types pour la création de produit
export interface CreateProduitData {
  nom: string;
  description: string;
  prix: number;
  images: string[];
  categorie: string;
  quantiteStock: number;
  // Détails du produit
  tailles?: string[];
  couleurs?: string[];
  marque?: string;
  matiere?: string;
  poids?: string;
  dimensions?: string;
  garantie?: string;
  origine?: string;
  attributsPersonnalises?: { [key: string]: any };
}

// Type pour la création de commande
export interface CreateCommandeData {
  adresseLivraison: string;
  methodePaiement: 'MOBILE_MONEY';
  numeroTelephone: string;
  items: {
    produitId: string;
    quantite: number;
  }[];
}

// Type pour les statistiques (vendeur/admin)
export interface Statistics {
  totalVentes: number;
  commandesEnCours: number;
  produitsActifs: number;
  revenuMensuel: number;
}

// Type pour les filtres de recherche
export interface SearchFilters {
  categorie?: string;
  prixMin?: number;
  prixMax?: number;
  livraison?: boolean;
  recherche?: string;
}

// Messages d'erreur standardisés
export const MESSAGES_ERREUR = {
  COMPTE_EN_ATTENTE: "Votre compte vendeur est en attente d'approbation par l'administrateur",
  COMPTE_REFUSE: "Votre compte vendeur a été rejeté. Contactez l'administration",
  COMPTE_SUSPENDU: "Votre compte vendeur est suspendu",
  BOUTIQUE_INCOMPLETE: "Veuillez compléter les informations de votre boutique",
  BOUTIQUE_EN_ATTENTE: "Votre boutique est en cours de validation",
  BOUTIQUE_REJETEE: "Votre boutique a été rejetée",
  ERREUR_RESEAU: "Erreur de connexion. Vérifiez votre connexion internet",
  ERREUR_SERVEUR: "Erreur serveur. Veuillez réessayer plus tard"
};
