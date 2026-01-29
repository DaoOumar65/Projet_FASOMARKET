// components/VariantesEditor.tsx
import React, { useState } from 'react';

interface VariantePersonnalisee {
  couleur?: string;
  taille?: string;
  modele?: string;
  materiau?: string;
  finition?: string;
  capacite?: string;
  puissance?: string;
  parfum?: string;
  ageCible?: string;
  genre?: string;
  saison?: string;
  poids?: number;
  dimensions?: string;
  prixAjustement: number;
  stock: number;
}

interface Props {
  variantes: VariantePersonnalisee[];
  onChange: (variantes: VariantePersonnalisee[]) => void;
  utiliserVariantesParDefaut: boolean;
  onToggleDefaut: (utiliser: boolean) => void;
}

export const VariantesEditor: React.FC<Props> = ({
  variantes,
  onChange,
  utiliserVariantesParDefaut,
  onToggleDefaut
}) => {
  const ajouterVariante = () => {
    const nouvelleVariante: VariantePersonnalisee = {
      prixAjustement: 0,
      stock: 1
    };
    onChange([...variantes, nouvelleVariante]);
  };

  const modifierVariante = (index: number, champ: string, valeur: any) => {
    const nouvelles = [...variantes];
    nouvelles[index] = { ...nouvelles[index], [champ]: valeur };
    onChange(nouvelles);
  };

  const supprimerVariante = (index: number) => {
    onChange(variantes.filter((_, i) => i !== index));
  };

  return (
    <div className="variantes-editor">
      <h3 className="text-lg font-semibold mb-4">Gestion des Variantes</h3>
      
      {/* Toggle variantes par défaut */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={utiliserVariantesParDefaut}
            onChange={(e) => onToggleDefaut(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">
            Utiliser les variantes par défaut de la catégorie
          </span>
        </label>
        <p className="text-xs text-gray-600 mt-1">
          Si coché, le système générera automatiquement les variantes selon la catégorie sélectionnée
        </p>
      </div>

      {/* Variantes personnalisées */}
      {!utiliserVariantesParDefaut && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Variantes Personnalisées</h4>
            <button
              type="button"
              onClick={ajouterVariante}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Ajouter Variante
            </button>
          </div>

          {variantes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune variante définie</p>
              <p className="text-sm">Cliquez sur "Ajouter Variante" pour commencer</p>
            </div>
          )}

          {variantes.map((variante, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 bg-white">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <input
                    type="text"
                    value={variante.couleur || ''}
                    onChange={(e) => modifierVariante(index, 'couleur', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: Rouge, Bleu..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Taille</label>
                  <input
                    type="text"
                    value={variante.taille || ''}
                    onChange={(e) => modifierVariante(index, 'taille', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: S, M, L..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modèle</label>
                  <input
                    type="text"
                    value={variante.modele || ''}
                    onChange={(e) => modifierVariante(index, 'modele', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: Standard, Premium..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Matériau</label>
                  <input
                    type="text"
                    value={variante.materiau || ''}
                    onChange={(e) => modifierVariante(index, 'materiau', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: Coton, Polyester..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Finition</label>
                  <input
                    type="text"
                    value={variante.finition || ''}
                    onChange={(e) => modifierVariante(index, 'finition', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: Mat, Brillant..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacité</label>
                  <input
                    type="text"
                    value={variante.capacite || ''}
                    onChange={(e) => modifierVariante(index, 'capacite', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ex: 64GB, 128GB..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <select
                    value={variante.genre || ''}
                    onChange={(e) => modifierVariante(index, 'genre', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Unisexe">Unisexe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={variante.poids || ''}
                    onChange={(e) => modifierVariante(index, 'poids', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ajustement Prix (FCFA)</label>
                  <input
                    type="number"
                    value={variante.prixAjustement}
                    onChange={(e) => modifierVariante(index, 'prixAjustement', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={variante.stock}
                    onChange={(e) => modifierVariante(index, 'stock', parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded"
                    placeholder="1"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => supprimerVariante(index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Supprimer cette variante
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};