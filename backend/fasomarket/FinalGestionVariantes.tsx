// components/FinalGestionVariantes.tsx
import React, { useState, useEffect } from 'react';
import { finalVariantesService, FinalVariante } from '../services/finalVariantesService';

interface Props {
  produitId: string;
}

const FinalGestionVariantes: React.FC<Props> = ({ produitId }) => {
  const [variantes, setVariantes] = useState<FinalVariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    couleur: '',
    taille: '',
    stock: 0
  });

  useEffect(() => {
    initializeComponent();
  }, [produitId]);

  const initializeComponent = async () => {
    setLoading(true);
    
    // Tester la connexion backend
    const connected = await finalVariantesService.testConnection();
    setBackendConnected(connected);
    
    // Charger les variantes
    await chargerVariantes();
    
    setLoading(false);
  };

  const chargerVariantes = async () => {
    try {
      const data = await finalVariantesService.getVariantes(produitId);
      setVariantes(data);
    } catch (error) {
      console.error('Erreur chargement variantes:', error);
      // Les données par défaut sont gérées dans le service
    }
  };

  const ajouterVariante = async () => {
    try {
      if (!formData.couleur || !formData.taille) {
        alert('Couleur et taille sont obligatoires');
        return;
      }

      const nouvelleVariante = await finalVariantesService.createVariante(produitId, formData);
      setVariantes(prev => [...prev, nouvelleVariante]);
      
      // Réinitialiser le formulaire
      setFormData({ couleur: '', taille: '', stock: 0 });
      setShowAddForm(false);
      
      alert('Variante ajoutée avec succès');
      
    } catch (error) {
      console.error('Erreur ajout variante:', error);
      alert('Erreur lors de l\'ajout de la variante');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des variantes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status de connexion */}
      <div className={`p-4 rounded-lg ${backendConnected ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${backendConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className={`font-medium ${backendConnected ? 'text-green-800' : 'text-yellow-800'}`}>
            {backendConnected ? 'Backend connecté' : 'Mode dégradé - données simulées'}
          </span>
        </div>
      </div>

      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Variantes du Produit</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Ajouter une variante
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Ajouter une variante</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur *
              </label>
              <input
                type="text"
                value={formData.couleur}
                onChange={(e) => setFormData(prev => ({ ...prev, couleur: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Rouge, Bleu..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille *
              </label>
              <input
                type="text"
                value={formData.taille}
                onChange={(e) => setFormData(prev => ({ ...prev, taille: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: S, M, L, XL..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={ajouterVariante}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des variantes */}
      <div className="space-y-4">
        {variantes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune variante trouvée pour ce produit.</p>
            <p className="text-sm mt-2">Cliquez sur "Ajouter une variante" pour commencer.</p>
          </div>
        ) : (
          variantes.map((variante) => (
            <div key={variante.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Couleur:</span>
                  <p className="font-medium">{variante.couleur}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Taille:</span>
                  <p className="font-medium">{variante.taille}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Stock:</span>
                  <p className="font-medium">{variante.stock}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p className={`font-medium text-xs ${
                    variante.status === 'default' ? 'text-yellow-600' : 
                    variante.status === 'simulated' ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {variante.status === 'default' ? 'Données par défaut' :
                     variante.status === 'simulated' ? 'Simulé' :
                     'Créé'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FinalGestionVariantes;