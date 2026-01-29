import React from 'react';
import { Trash2 } from 'lucide-react';
import { VariantItem } from '../types/category';

interface Props {
  variant: VariantItem;
  onChange: (variant: VariantItem) => void;
  onDelete: () => void;
}

export const VariantForm: React.FC<Props> = ({ variant, onChange, onDelete }) => {
  const updateField = (field: keyof VariantItem, value: string | number) => {
    onChange({ ...variant, [field]: value });
  };

  return (
    <div className="variant-form border border-gray-200 p-4 rounded-lg bg-white">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input 
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Couleur"
          value={variant.couleur || ''}
          onChange={(e) => updateField('couleur', e.target.value)}
        />
        <input 
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Taille"
          value={variant.taille || ''}
          onChange={(e) => updateField('taille', e.target.value)}
        />
        <input 
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Modèle"
          value={variant.modele || ''}
          onChange={(e) => updateField('modele', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input 
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Matériau"
          value={variant.materiau || ''}
          onChange={(e) => updateField('materiau', e.target.value)}
        />
        <input 
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Finition"
          value={variant.finition || ''}
          onChange={(e) => updateField('finition', e.target.value)}
        />
        <input 
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Capacité"
          value={variant.capacite || ''}
          onChange={(e) => updateField('capacite', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="number"
          className="px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Ajustement prix (FCFA)"
          value={variant.prixAjustement}
          onChange={(e) => updateField('prixAjustement', parseInt(e.target.value) || 0)}
        />
        <button 
          onClick={onDelete} 
          className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>
    </div>
  );
};