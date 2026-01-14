import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/api';
import AdresseMapSimple from '../components/AdresseMapSimple';
import type { Adresse } from '../types';

export default function ClientAdresses() {
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdresse, setEditingAdresse] = useState<Adresse | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    parDefaut: false
  });

  useEffect(() => {
    fetchAdresses();
  }, []);

  const fetchAdresses = async () => {
    try {
      const response = await clientService.getAdresses();
      setAdresses(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des adresses:', error);
      setAdresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdresse) {
        await clientService.updateAdresse(editingAdresse.id, formData);
        toast.success('Adresse modifiée avec succès');
      } else {
        await clientService.ajouterAdresse(formData);
        toast.success('Adresse ajoutée avec succès');
      }
      setShowModal(false);
      setEditingAdresse(null);
      setFormData({ nom: '', adresse: '', telephone: '', parDefaut: false });
      fetchAdresses();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const supprimerAdresse = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette adresse ?')) {
      try {
        await clientService.supprimerAdresse(id);
        setAdresses(adresses.filter(a => a.id !== id));
        toast.success('Adresse supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const definirParDefaut = async (id: string) => {
    try {
      await clientService.definirAdresseParDefaut(id);
      setAdresses(adresses.map(a => ({ ...a, parDefaut: a.id === id })));
      toast.success('Adresse définie par défaut');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const openModal = (adresse?: Adresse) => {
    if (adresse) {
      setEditingAdresse(adresse);
      setFormData({
        nom: adresse.nom,
        adresse: adresse.adresse,
        telephone: adresse.telephone,
        parDefaut: adresse.parDefaut
      });
    } else {
      setEditingAdresse(null);
      setFormData({ nom: '', adresse: '', telephone: '', parDefaut: false });
    }
    setShowModal(true);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <MapPin className="w-8 h-8 mr-3 text-blue-600" />
              Mes adresses
            </h1>
            <p className="text-gray-600">
              Gérez vos adresses de livraison
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une adresse
          </button>
        </div>

        {adresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adresses.map((adresse) => (
              <div
                key={adresse.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                  adresse.parDefaut ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {adresse.nom}
                      </h3>
                      {adresse.parDefaut && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Check className="w-3 h-3 mr-1" />
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{adresse.adresse}</p>
                    <p className="text-sm text-gray-500">{adresse.telephone}</p>
                    
                    {/* Composant de localisation */}
                    <div className="mt-3">
                      <AdresseMapSimple 
                        adresse={adresse.adresse}
                        nom={adresse.nom}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!adresse.parDefaut && (
                    <button
                      onClick={() => definirParDefaut(adresse.id)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Définir par défaut
                    </button>
                  )}
                  <button
                    onClick={() => openModal(adresse)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => supprimerAdresse(adresse.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Supprimer"
                    disabled={adresse.parDefaut}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune adresse enregistrée
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez une adresse pour faciliter vos commandes
            </p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter ma première adresse
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAdresse ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'adresse
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Domicile, Bureau, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse complète
                    </label>
                    <textarea
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Rue, quartier, ville..."
                      required
                    />
                    
                    {/* Aperçu de l'adresse */}
                    {formData.adresse && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">Aperçu de l'adresse :</p>
                        <AdresseMapSimple 
                          adresse={formData.adresse}
                          nom={formData.nom || 'Nouvelle adresse'}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+226 XX XX XX XX"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="parDefaut"
                      checked={formData.parDefaut}
                      onChange={(e) => setFormData({ ...formData, parDefaut: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="parDefaut" className="ml-2 block text-sm text-gray-900">
                      Définir comme adresse par défaut
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingAdresse ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}