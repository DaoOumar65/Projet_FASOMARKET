// ConfigurationVariantes.tsx - Interface Admin pour configurer les variantes
import React, { useState, useEffect } from 'react';

interface VarianteConfig {
  couleur?: string;
  taille?: string;
  modele?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  parfum?: string;
  genre?: string;
  saison?: string;
  poids?: string;
  prixAjustement: string;
}

interface CategorieConfig {
  id: string;
  name: string;
  variants: VarianteConfig[];
}

export const ConfigurationVariantes: React.FC = () => {
  const [categories, setCategories] = useState<CategorieConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [variants, setVariants] = useState<VarianteConfig[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadVariantConfig = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/variant-config`);
      const data = await response.json();
      setVariants(data.variants || []);
    } catch (error) {
      console.error('Erreur chargement config:', error);
      setVariants([]);
    }
  };

  const saveVariantConfig = async () => {
    try {
      const config = { variants };
      await fetch(`/api/admin/categories/${selectedCategory}/variant-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      alert('Configuration sauvegardée !');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const addVariant = () => {
    setVariants([...variants, { prixAjustement: '0' }]);
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="configuration-variantes p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration des Variantes par Catégorie</h1>
      
      {/* Sélection catégorie */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Catégorie</label>
        <select 
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            if (e.target.value) loadVariantConfig(e.target.value);
          }}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Variantes</h2>
            <button 
              onClick={addVariant}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Ajouter Variante
            </button>
          </div>

          {/* Liste des variantes */}
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="border p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Couleur"
                    value={variant.couleur || ''}
                    onChange={(e) => updateVariant(index, 'couleur', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Taille"
                    value={variant.taille || ''}
                    onChange={(e) => updateVariant(index, 'taille', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Modèle"
                    value={variant.modele || ''}
                    onChange={(e) => updateVariant(index, 'modele', e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Matériau"
                    value={variant.materiau || ''}
                    onChange={(e) => updateVariant(index, 'materiau', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Finition"
                    value={variant.finition || ''}
                    onChange={(e) => updateVariant(index, 'finition', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Capacité"
                    value={variant.capacite || ''}
                    onChange={(e) => updateVariant(index, 'capacite', e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Parfum"
                    value={variant.parfum || ''}
                    onChange={(e) => updateVariant(index, 'parfum', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <select
                    value={variant.genre || ''}
                    onChange={(e) => updateVariant(index, 'genre', e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="">Genre</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Unisexe">Unisexe</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Poids (kg)"
                    value={variant.poids || ''}
                    onChange={(e) => updateVariant(index, 'poids', e.target.value)}
                    className="p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Ajustement prix (FCFA)"
                    value={variant.prixAjustement}
                    onChange={(e) => updateVariant(index, 'prixAjustement', e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>

                <button
                  onClick={() => removeVariant(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          {variants.length > 0 && (
            <div className="mt-6">
              <button
                onClick={saveVariantConfig}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Sauvegarder Configuration
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};