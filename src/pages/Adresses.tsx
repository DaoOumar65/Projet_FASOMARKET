import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Edit } from 'lucide-react';

interface Adresse {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  parDefaut: boolean;
}

export default function Adresses() {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nom: '', adresse: '', telephone: '', parDefaut: false });

  useEffect(() => {
    fetchAdresses();
  }, []);

  const fetchAdresses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/client/adresses', {
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        setAdresses(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/client/adresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchAdresses();
        setShowForm(false);
        setFormData({ nom: '', adresse: '', telephone: '', parDefaut: false });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteAdresse = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/client/adresses/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        fetchAdresses();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Adresses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Nouvelle adresse</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nom (ex: Maison, Bureau)"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="Adresse complète"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              required
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.parDefaut}
                onChange={(e) => setFormData({ ...formData, parDefaut: e.target.checked })}
                className="mr-2"
              />
              Définir comme adresse par défaut
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {adresses.map((adresse) => (
          <div key={adresse.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">{adresse.nom}</h3>
                  {adresse.parDefaut && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Par défaut</span>
                  )}
                  <p className="text-gray-600 mt-2">{adresse.adresse}</p>
                  <p className="text-gray-600">{adresse.telephone}</p>
                </div>
              </div>
              <button
                onClick={() => deleteAdresse(adresse.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {adresses.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune adresse enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}
