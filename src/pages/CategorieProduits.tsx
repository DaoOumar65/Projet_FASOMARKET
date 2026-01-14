import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, Package, Filter, ArrowLeft, Search } from 'lucide-react';
import { publicService } from '../services/api';
import type { Produit, Categorie } from '../types';

export default function CategorieProduits() {
  const { id } = useParams<{ id: string }>();
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [produitsLoading, setProduitsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nom' | 'prix-asc' | 'prix-desc'>('nom');

  useEffect(() => {
    if (id) {
      fetchCategorie();
      fetchProduits();
    }
  }, [id]);

  const fetchCategorie = async () => {
    try {
      const categories = await publicService.getCategories();
      const foundCategorie = categories.data.find(cat => cat.id === id);
      setCategorie(foundCategorie || null);
    } catch (error) {
      console.error('Erreur lors du chargement de la catégorie:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await publicService.getCategorieProduits(id!);
      setProduits(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // Fallback avec des données de test
      setProduits([]);
    } finally {
      setProduitsLoading(false);
    }
  };

  const filteredAndSortedProduits = produits
    .filter(produit => 
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'prix-asc':
          return a.prix - b.prix;
        case 'prix-desc':
          return b.prix - a.prix;
        default:
          return a.nom.localeCompare(b.nom);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!categorie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Catégorie non trouvée</h2>
          <Link to="/categories" className="text-blue-600 hover:text-blue-500">
            Retour aux catégories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de la catégorie */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux catégories
          </Link>

          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {categorie.icone ? (
                <span className="text-2xl">{categorie.icone}</span>
              ) : (
                <Grid className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-2">{categorie.nom}</h1>
              <p className="text-blue-100 text-lg">{categorie.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="nom">Trier par nom</option>
                  <option value="prix-asc">Prix croissant</option>
                  <option value="prix-desc">Prix décroissant</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredAndSortedProduits.length} produit{filteredAndSortedProduits.length > 1 ? 's' : ''} trouvé{filteredAndSortedProduits.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille des produits */}
        {produitsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAndSortedProduits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedProduits.map((produit) => (
              <Link
                key={produit.id}
                to={`/produits/${produit.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="h-48 bg-gray-200">
                  {produit.images && produit.images[0] ? (
                    <img
                      src={produit.images[0]}
                      alt={produit.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
                    {produit.nom}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {produit.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-blue-600">
                      {produit.prix.toLocaleString()} FCFA
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      produit.disponible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produit.disponible ? 'Disponible' : 'Rupture'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Stock: {produit.quantiteStock}</span>
                    <span className="line-clamp-1">{produit.boutique.nom}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `Aucun produit ne correspond à "${searchTerm}" dans cette catégorie`
                : 'Cette catégorie ne contient pas encore de produits'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-500"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}