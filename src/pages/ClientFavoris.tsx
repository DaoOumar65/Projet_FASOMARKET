import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/api';
import { useAuthStore, usePanierStore } from '../store';
import type { Favori } from '../types';

export default function ClientFavoris() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { addItem } = usePanierStore();

  useEffect(() => {
    fetchFavoris();
  }, []);

  const fetchFavoris = async () => {
    try {
      const response = await clientService.getFavoris();
      setFavoris(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  };

  const supprimerFavori = async (produitId: string) => {
    try {
      await clientService.supprimerDesFavoris(produitId);
      setFavoris(favoris.filter(f => f.produit.id !== produitId));
      toast.success('Produit retiré des favoris');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const ajouterAuPanier = async (favori: Favori) => {
    try {
      await clientService.ajouterAuPanier(favori.produit.id, 1);
      addItem({
        id: `${favori.produit.id}-${Date.now()}`,
        produit: favori.produit,
        quantite: 1,
      });
      toast.success('Produit ajouté au panier !');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Heart className="w-8 h-8 mr-3 text-red-500" />
            Mes favoris
          </h1>
          <p className="text-gray-600">
            {favoris.length} produit{favoris.length > 1 ? 's' : ''} dans vos favoris
          </p>
        </div>

        {favoris.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoris.map((favori) => (
              <div
                key={favori.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative">
                  <div className="h-48 bg-gray-200">
                    {favori.produit.images && favori.produit.images[0] ? (
                      <img
                        src={favori.produit.images[0]}
                        alt={favori.produit.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => supprimerFavori(favori.produit.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  <Link
                    to={`/produits/${favori.produit.id}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {favori.produit.nom}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {favori.produit.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-blue-600">
                      {favori.produit.prix.toLocaleString()} FCFA
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      favori.produit.disponible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {favori.produit.disponible ? 'Disponible' : 'Rupture'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Stock: {favori.produit.quantiteStock}</span>
                    <Link
                      to={`/boutiques/${favori.produit.boutique.id}`}
                      className="hover:text-blue-600 line-clamp-1"
                    >
                      {favori.produit.boutique.nom}
                    </Link>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/produits/${favori.produit.id}`}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
                    >
                      Voir détails
                    </Link>
                    
                    {favori.produit.disponible && (
                      <button
                        onClick={() => ajouterAuPanier(favori)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Panier
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Ajouté le {new Date(favori.dateAjout).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Parcourez nos produits et ajoutez vos coups de cœur à vos favoris
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Découvrir les produits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}