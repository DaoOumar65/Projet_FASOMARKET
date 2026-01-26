import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';

interface Produit {
  id: string;
  nom: string;
  prix: number;
  images: string[];
  boutique: { nom: string };
}

export default function Favoris() {
  const [favoris, setFavoris] = useState<Produit[]>([]);

  useEffect(() => {
    const fetchFavoris = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch('http://localhost:8081/api/client/favoris', {
          headers: { 'X-User-Id': userId || '' }
        });
        if (response.ok) {
          setFavoris(await response.json());
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchFavoris();
  }, []);

  const removeFavori = async (produitId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/client/favoris/${produitId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        setFavoris(favoris.filter(f => f.id !== produitId));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>

      {favoris.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favoris.map((produit) => (
            <div key={produit.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Link to={`/produits/${produit.id}`}>
                <img
                  src={produit.images[0] || '/placeholder.png'}
                  alt={produit.nom}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/produits/${produit.id}`}>
                  <h3 className="font-bold text-lg mb-2 hover:text-blue-600">{produit.nom}</h3>
                </Link>
                <p className="text-gray-600 text-sm mb-2">{produit.boutique.nom}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-blue-600">{produit.prix.toLocaleString()} FCFA</p>
                  <button
                    onClick={() => removeFavori(produit.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">Aucun favori pour le moment</p>
          <Link to="/produits" className="text-blue-600 hover:underline mt-4 inline-block">
            Découvrir des produits
          </Link>
        </div>
      )}
    </div>
  );
}
