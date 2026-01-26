import { useEffect, useState } from 'react';
import { User, Store, Phone, MapPin } from 'lucide-react';

interface Profil {
  nomComplet: string;
  telephone: string;
  carteIdentite: string;
}

interface Boutique {
  id: string;
  nom: string;
  description: string;
  adresse: string;
  telephone: string;
  livraison: boolean;
  fraisLivraison: number;
}

export default function ProfilVendeur() {
  const [profil, setProfil] = useState<Profil>({ nomComplet: '', telephone: '', carteIdentite: '' });
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [editingBoutique, setEditingBoutique] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const [profilRes, boutiqueRes] = await Promise.all([
          fetch('http://localhost:8081/api/vendeur/profil', {
            headers: { 'X-User-Id': userId || '' }
          }),
          fetch('http://localhost:8081/api/vendeur/boutiques', {
            headers: { 'X-User-Id': userId || '' }
          })
        ]);

        if (profilRes.ok) setProfil(await profilRes.json());
        if (boutiqueRes.ok) {
          const boutiques = await boutiqueRes.json();
          if (boutiques.length > 0) setBoutique(boutiques[0]);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchData();
  }, []);

  const handleBoutiqueUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boutique) return;

    try {
      const userId = localStorage.getItem('userId');
      const url = boutique.id
        ? `http://localhost:8081/api/vendeur/boutiques/${boutique.id}`
        : 'http://localhost:8081/api/vendeur/boutiques/creer';
      
      const response = await fetch(url, {
        method: boutique.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify(boutique)
      });

      if (response.ok) {
        setEditingBoutique(false);
        alert('Boutique mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mon Profil Vendeur</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-700">{profil.nomComplet}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-700">{profil.telephone}</span>
          </div>
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-700">Carte d'identité: {profil.carteIdentite}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ma Boutique</h2>
          <button
            onClick={() => setEditingBoutique(!editingBoutique)}
            className="text-blue-600 hover:underline"
          >
            {editingBoutique ? 'Annuler' : boutique ? 'Modifier' : 'Créer'}
          </button>
        </div>

        {boutique && !editingBoutique ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <Store className="w-5 h-5 text-gray-400 mr-3" />
              <span className="font-semibold">{boutique.nom}</span>
            </div>
            <p className="text-gray-600">{boutique.description}</p>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">{boutique.adresse}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">{boutique.telephone}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded ${boutique.livraison ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {boutique.livraison ? `Livraison: ${boutique.fraisLivraison} FCFA` : 'Pas de livraison'}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBoutiqueUpdate}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom de la boutique"
                value={boutique?.nom || ''}
                onChange={(e) => setBoutique({ ...boutique!, nom: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={boutique?.description || ''}
                onChange={(e) => setBoutique({ ...boutique!, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
              <input
                type="text"
                placeholder="Adresse"
                value={boutique?.adresse || ''}
                onChange={(e) => setBoutique({ ...boutique!, adresse: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={boutique?.telephone || ''}
                onChange={(e) => setBoutique({ ...boutique!, telephone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={boutique?.livraison || false}
                  onChange={(e) => setBoutique({ ...boutique!, livraison: e.target.checked })}
                  className="mr-2"
                />
                Proposer la livraison
              </label>
              {boutique?.livraison && (
                <input
                  type="number"
                  placeholder="Frais de livraison (FCFA)"
                  value={boutique?.fraisLivraison || 0}
                  onChange={(e) => setBoutique({ ...boutique!, fraisLivraison: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )}
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {boutique?.id ? 'Mettre à jour' : 'Créer la boutique'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
