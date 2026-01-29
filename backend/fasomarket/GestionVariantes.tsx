// components/GestionVariantes.tsx
import React, { useState, useEffect } from 'react';
import { variantesService, Variante, VarianteRequest, StockInfo } from '../services/variantesService';
import { toast } from 'react-toastify';

interface Props {
  produitId: string;
}

const GestionVariantes: React.FC<Props> = ({ produitId }) => {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariante, setEditingVariante] = useState<Variante | null>(null);
  
  // Formulaire d'ajout/modification
  const [formData, setFormData] = useState<VarianteRequest>({
    couleur: '',
    taille: '',
    modele: 'Standard',
    prixAjustement: 0,
    stock: 0,
    materiau: '',
    genre: 'Unisexe'
  });

  // Charger les variantes au montage du composant
  useEffect(() => {
    chargerVariantes();
    chargerStockInfo();
  }, [produitId]);

  const chargerVariantes = async () => {
    try {
      setLoading(true);
      const data = await variantesService.getVariantes(produitId);
      setVariantes(data);
    } catch (error: any) {
      console.error('Erreur chargement variantes:', error);
      
      if (error.response?.status === 500) {
        toast.error('Erreur serveur - interface en mode dégradé');
        setVariantes([]);
      } else {
        toast.error('Erreur lors du chargement des variantes');
        setVariantes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const chargerStockInfo = async () => {
    try {
      const info = await variantesService.getStockInfo(produitId);
      setStockInfo(info);
    } catch (error) {
      console.error('Erreur chargement stock info:', error);
    }
  };

  const ajouterVariante = async () => {
    try {
      if (!formData.couleur || !formData.taille) {
        toast.error('Couleur et taille sont obligatoires');
        return;
      }

      const nouvelleVariante = await variantesService.createVariante(produitId, formData);
      setVariantes(prev => [...prev, nouvelleVariante]);
      
      // Réinitialiser le formulaire
      setFormData({
        couleur: '',
        taille: '',
        modele: 'Standard',
        prixAjustement: 0,
        stock: 0,
        materiau: '',
        genre: 'Unisexe'
      });
      
      setShowAddForm(false);
      toast.success('Variante ajoutée avec succès');
      
      // Recharger les infos de stock
      chargerStockInfo();
      
    } catch (error: any) {
      console.error('Erreur ajout variante:', error);
      toast.error('Erreur lors de l\'ajout de la variante');
    }
  };

  const modifierVariante = async () => {
    if (!editingVariante) return;

    try {
      const varianteModifiee = await variantesService.updateVariante(
        produitId, 
        editingVariante.id, 
        formData
      );
      
      setVariantes(prev => 
        prev.map(v => v.id === editingVariante.id ? varianteModifiee : v)
      );
      
      setEditingVariante(null);
      setFormData({
        couleur: '',
        taille: '',
        modele: 'Standard',
        prixAjustement: 0,
        stock: 0,
        materiau: '',
        genre: 'Unisexe'
      });
      
      toast.success('Variante modifiée avec succès');
      chargerStockInfo();
      
    } catch (error: any) {
      console.error('Erreur modification variante:', error);
      toast.error('Erreur lors de la modification de la variante');
    }
  };

  const supprimerVariante = async (varianteId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette variante ?')) {
      return;
    }

    try {
      await variantesService.deleteVariante(produitId, varianteId);
      setVariantes(prev => prev.filter(v => v.id !== varianteId));
      toast.success('Variante supprimée avec succès');
      chargerStockInfo();
      
    } catch (error: any) {
      console.error('Erreur suppression variante:', error);
      toast.error('Erreur lors de la suppression de la variante');
    }
  };

  const startEdit = (variante: Variante) => {
    setEditingVariante(variante);
    setFormData({
      couleur: variante.couleur,
      taille: variante.taille,
      modele: variante.modele || 'Standard',
      prixAjustement: variante.prixAjustement,
      stock: variante.stock,
      materiau: '',
      genre: 'Unisexe'
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingVariante(null);
    setShowAddForm(false);
    setFormData({
      couleur: '',
      taille: '',
      modele: 'Standard',
      prixAjustement: 0,
      stock: 0,
      materiau: '',
      genre: 'Unisexe'
    });
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
      {/* Informations de stock */}
      {stockInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Informations de Stock</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Stock Global:</span>
              <span className="font-semibold ml-2">{stockInfo.stockGlobal}</span>
            </div>
            <div>
              <span className="text-gray-600">Stock Variantes:</span>
              <span className="font-semibold ml-2">{stockInfo.stockVariantesTotal}</span>
            </div>
            <div>
              <span className="text-gray-600">Stock Disponible:</span>
              <span className="font-semibold ml-2">{stockInfo.stockDisponible}</span>
            </div>
            <div>
              <span className="text-gray-600">Statut:</span>
              <span className={`font-semibold ml-2 ${stockInfo.stockValide ? 'text-green-600' : 'text-red-600'}`}>
                {stockInfo.stockValide ? 'Valide' : 'Invalide'}
              </span>
            </div>
          </div>
        </div>
      )}

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

      {/* Formulaire d'ajout/modification */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">
            {editingVariante ? 'Modifier la variante' : 'Ajouter une variante'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Modèle
              </label>
              <input
                type="text"
                value={formData.modele}
                onChange={(e) => setFormData(prev => ({ ...prev, modele: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Standard, Premium..."
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ajustement Prix (FCFA)
              </label>
              <input
                type="number"
                value={formData.prixAjustement}
                onChange={(e) => setFormData(prev => ({ ...prev, prixAjustement: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingVariante ? modifierVariante : ajouterVariante}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {editingVariante ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              onClick={cancelEdit}
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
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
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
                    <span className="text-sm text-gray-600">SKU:</span>
                    <p className="font-medium text-xs">{variante.sku}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(variante)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => supprimerVariante(variante.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              
              {variante.prixAjustement !== 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Ajustement prix: {variante.prixAjustement > 0 ? '+' : ''}{variante.prixAjustement} FCFA
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GestionVariantes;