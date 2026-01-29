import React, { useState, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';
import { VariantForm } from './VariantForm';
import { VariantItem, VariantConfig } from '../types/category';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

interface Props {
  categoryId: string;
}

export const VariantConfigEditor: React.FC<Props> = ({ categoryId }) => {
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [categoryId]);

  const loadConfig = async () => {
    try {
      const response = await categoryService.getVariantConfig(categoryId);
      setVariants(response.data.variants || []);
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await categoryService.saveVariantConfig(categoryId, { variants });
      toast.success('Configuration sauvegardée');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { prixAjustement: 0 }]);
  };

  const updateVariant = (index: number, updated: VariantItem) => {
    const newVariants = [...variants];
    newVariants[index] = updated;
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="variant-config-editor space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuration des Variantes</h3>
        <div className="flex gap-2">
          <button 
            onClick={addVariant}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <Plus size={16} />
            Ajouter Variante
          </button>
          <button 
            onClick={saveConfig}
            disabled={loading}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <VariantForm 
            key={index}
            variant={variant}
            onChange={(updated) => updateVariant(index, updated)}
            onDelete={() => removeVariant(index)}
          />
        ))}
        
        {variants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune variante configurée. Cliquez sur "Ajouter Variante" pour commencer.
          </div>
        )}
      </div>
    </div>
  );
};