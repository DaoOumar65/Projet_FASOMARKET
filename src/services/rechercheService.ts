import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/public';

export interface FiltresRecherche {
  recherche?: string;
  prixMin?: number;
  prixMax?: number;
  categories?: string[];
  marques?: string[];
  disponibilite?: 'tous' | 'en_stock' | 'rupture';
  localisation?: string;
  noteMin?: number;
  tri?: 'pertinence' | 'prix_asc' | 'prix_desc' | 'popularite' | 'note' | 'recent';
  page?: number;
  size?: number;
}

export interface ResultatRecherche {
  produits: any[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  facettes: {
    categories: Array<{id: string, nom: string, count: number}>;
    marques: Array<{nom: string, count: number}>;
    localisations: Array<{nom: string, count: number}>;
    prixMin: number;
    prixMax: number;
  };
}

class RechercheService {
  async rechercher(filtres: FiltresRecherche): Promise<ResultatRecherche> {
    try {
      const params = this.buildSearchParams(filtres);
      const response = await axios.get(`${API_BASE_URL}/recherche-avancee`, { params });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche:', error);
      // Fallback avec données simulées
      return this.getFallbackResults(filtres);
    }
  }

  private buildSearchParams(filtres: FiltresRecherche): URLSearchParams {
    const params = new URLSearchParams();
    
    if (filtres.recherche) params.append('q', filtres.recherche);
    if (filtres.prixMin && filtres.prixMin > 0) params.append('prixMin', filtres.prixMin.toString());
    if (filtres.prixMax && filtres.prixMax < 1000000) params.append('prixMax', filtres.prixMax.toString());
    if (filtres.categories?.length) params.append('categories', filtres.categories.join(','));
    if (filtres.marques?.length) params.append('marques', filtres.marques.join(','));
    if (filtres.disponibilite && filtres.disponibilite !== 'tous') params.append('disponibilite', filtres.disponibilite);
    if (filtres.localisation) params.append('localisation', filtres.localisation);
    if (filtres.noteMin && filtres.noteMin > 0) params.append('noteMin', filtres.noteMin.toString());
    if (filtres.tri) params.append('tri', filtres.tri);
    
    params.append('page', (filtres.page || 0).toString());
    params.append('size', (filtres.size || 20).toString());
    
    return params;
  }

  private getFallbackResults(filtres: FiltresRecherche): ResultatRecherche {
    // Données simulées pour démonstration
    const produits = [
      {
        id: '1',
        nom: 'iPhone 14 Pro',
        description: 'Smartphone Apple dernière génération',
        prix: 850000,
        stock: 15,
        marque: 'Apple',
        categorie: 'Électronique',
        localisation: 'Ouagadougou',
        note: 4.8,
        nombreVentes: 45,
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400']
      },
      {
        id: '2',
        nom: 'Samsung Galaxy S23',
        description: 'Smartphone Samsung haut de gamme',
        prix: 720000,
        stock: 8,
        marque: 'Samsung',
        categorie: 'Électronique',
        localisation: 'Bobo-Dioulasso',
        note: 4.6,
        nombreVentes: 32,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400']
      },
      {
        id: '3',
        nom: 'MacBook Air M2',
        description: 'Ordinateur portable Apple',
        prix: 1200000,
        stock: 5,
        marque: 'Apple',
        categorie: 'Informatique',
        localisation: 'Ouagadougou',
        note: 4.9,
        nombreVentes: 18,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400']
      }
    ];

    // Appliquer les filtres
    let produitsFiltres = [...produits];

    if (filtres.recherche) {
      const terme = filtres.recherche.toLowerCase();
      produitsFiltres = produitsFiltres.filter(p => 
        p.nom.toLowerCase().includes(terme) || 
        p.description.toLowerCase().includes(terme) ||
        p.marque.toLowerCase().includes(terme)
      );
    }

    if (filtres.prixMin && filtres.prixMin > 0) {
      produitsFiltres = produitsFiltres.filter(p => p.prix >= filtres.prixMin!);
    }

    if (filtres.prixMax && filtres.prixMax < 1000000) {
      produitsFiltres = produitsFiltres.filter(p => p.prix <= filtres.prixMax!);
    }

    if (filtres.marques?.length) {
      produitsFiltres = produitsFiltres.filter(p => filtres.marques!.includes(p.marque));
    }

    if (filtres.disponibilite === 'en_stock') {
      produitsFiltres = produitsFiltres.filter(p => p.stock > 0);
    } else if (filtres.disponibilite === 'rupture') {
      produitsFiltres = produitsFiltres.filter(p => p.stock === 0);
    }

    if (filtres.localisation) {
      produitsFiltres = produitsFiltres.filter(p => p.localisation === filtres.localisation);
    }

    if (filtres.noteMin && filtres.noteMin > 0) {
      produitsFiltres = produitsFiltres.filter(p => p.note >= filtres.noteMin!);
    }

    // Appliquer le tri
    switch (filtres.tri) {
      case 'prix_asc':
        produitsFiltres.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix_desc':
        produitsFiltres.sort((a, b) => b.prix - a.prix);
        break;
      case 'popularite':
        produitsFiltres.sort((a, b) => b.nombreVentes - a.nombreVentes);
        break;
      case 'note':
        produitsFiltres.sort((a, b) => b.note - a.note);
        break;
      case 'recent':
        // Simuler tri par date (inverse l'ordre)
        produitsFiltres.reverse();
        break;
      default: // pertinence
        // Garder l'ordre par défaut
        break;
    }

    return {
      produits: produitsFiltres,
      totalElements: produitsFiltres.length,
      totalPages: Math.ceil(produitsFiltres.length / (filtres.size || 20)),
      currentPage: filtres.page || 0,
      facettes: {
        categories: [
          { id: 'electronique', nom: 'Électronique', count: 2 },
          { id: 'informatique', nom: 'Informatique', count: 1 }
        ],
        marques: [
          { nom: 'Apple', count: 2 },
          { nom: 'Samsung', count: 1 }
        ],
        localisations: [
          { nom: 'Ouagadougou', count: 2 },
          { nom: 'Bobo-Dioulasso', count: 1 }
        ],
        prixMin: Math.min(...produits.map(p => p.prix)),
        prixMax: Math.max(...produits.map(p => p.prix))
      }
    };
  }

  async getCategories(): Promise<Array<{id: string, nom: string}>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      return response.data;
    } catch (error) {
      return [
        { id: 'electronique', nom: 'Électronique' },
        { id: 'informatique', nom: 'Informatique' },
        { id: 'mode', nom: 'Mode & Vêtements' },
        { id: 'maison', nom: 'Maison & Jardin' },
        { id: 'sport', nom: 'Sport & Loisirs' }
      ];
    }
  }

  async getMarques(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/marques`);
      return response.data;
    } catch (error) {
      return ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'HP', 'Dell'];
    }
  }

  async getLocalisations(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/localisations`);
      return response.data;
    } catch (error) {
      return ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya', 'Pouytenga'];
    }
  }
}

export const rechercheService = new RechercheService();