// components/GestionVariantesComplete.tsx
import React, { useState } from 'react';
import { VariantesAssistant } from './VariantesAssistant';
import { VariantesEditor } from './VariantesEditor';

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
  categorieId: string;
  categorieNom: string;
  variantes: VariantePersonnalisee[];
  onChange: (variantes: VariantePersonnalisee[]) => void;
}

export const GestionVariantesComplete: React.FC<Props> = ({
  categorieId,
  categorieNom,
  variantes,
  onChange
}) => {
  const [modeAssistant, setModeAssistant] = useState(true);
  const [variantesDefinies, setVariantesDefinies] = useState(false);

  const handleVariantesGenerated = (nouvellesVariantes: VariantePersonnalisee[]) => {
    onChange(nouvellesVariantes);
    setVariantesDefinies(true);
    setModeAssistant(false);
  };

  const recommencerAvecAssistant = () => {
    setModeAssistant(true);
    setVariantesDefinies(false);
  };

  const ajouterVarianteManuelle = () => {
    const nouvelleVariante: VariantePersonnalisee = {
      prixAjustement: 0,
      stock: 1
    };
    onChange([...variantes, nouvelleVariante]);
  };

  return (
    <div className="gestion-variantes-complete">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Gestion des Variantes</h2>
        <p className="text-gray-600">
          Définissez les différentes options disponibles pour votre produit
        </p>
      </div>

      {/* Assistant ou édition manuelle */}
      {modeAssistant && !variantesDefinies ? (
        <VariantesAssistant
          categorieId={categorieId}
          categorieNom={categorieNom}
          onVariantesGenerated={handleVariantesGenerated}
        />
      ) : (
        <div>
          {/* Barre d'actions */}
          <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {variantes.length} variante(s) définie(s)
              </span>
              {variantesDefinies && (
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                  ✓ Générées par l'assistant
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={recommencerAvecAssistant}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                🤖 Utiliser l'assistant
              </button>
              <button
                onClick={ajouterVarianteManuelle}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
              >
                + Ajouter variante
              </button>
            </div>
          </div>

          {/* Éditeur de variantes */}
          {variantes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium mb-2">Aucune variante définie</h3>
              <p className="text-gray-600 mb-4">
                Utilisez l'assistant pour générer des variantes automatiquement
                ou ajoutez-les manuellement
              </p>
              <div className="space-x-3">
                <button
                  onClick={recommencerAvecAssistant}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  🤖 Utiliser l'assistant
                </button>
                <button
                  onClick={ajouterVarianteManuelle}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  ✏️ Créer manuellement
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {variantes.map((variante, index) => (
                <VarianteCard
                  key={index}
                  variante={variante}
                  index={index}
                  onUpdate={(updatedVariante) => {
                    const nouvelles = [...variantes];
                    nouvelles[index] = updatedVariante;
                    onChange(nouvelles);
                  }}
                  onDelete={() => {
                    onChange(variantes.filter((_, i) => i !== index));
                  }}
                />
              ))}
            </div>
          )}

          {/* Résumé */}
          {variantes.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Résumé des variantes</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Total variantes:</span>
                  <div className="font-medium">{variantes.length}</div>
                </div>
                <div>
                  <span className="text-green-600">Stock total:</span>
                  <div className="font-medium">{variantes.reduce((sum, v) => sum + v.stock, 0)}</div>
                </div>
                <div>
                  <span className="text-green-600">Prix min:</span>
                  <div className="font-medium">
                    {Math.min(...variantes.map(v => v.prixAjustement))} FCFA
                  </div>
                </div>
                <div>
                  <span className="text-green-600">Prix max:</span>
                  <div className="font-medium">
                    +{Math.max(...variantes.map(v => v.prixAjustement))} FCFA
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant pour afficher une variante individuelle
const VarianteCard: React.FC<{
  variante: VariantePersonnalisee;
  index: number;
  onUpdate: (variante: VariantePersonnalisee) => void;
  onDelete: () => void;
}> = ({ variante, index, onUpdate, onDelete }) => {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...variante, [field]: value });
  };

  const getVarianteTitle = () => {
    const parts = [];
    if (variante.couleur) parts.push(variante.couleur);
    if (variante.taille) parts.push(variante.taille);
    if (variante.modele) parts.push(variante.modele);
    if (variante.capacite) parts.push(variante.capacite);
    return parts.length > 0 ? parts.join(' • ') : `Variante ${index + 1}`;
  };

  return (
    <div className="variante-card border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">{getVarianteTitle()}</h4>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          🗑️ Supprimer
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Couleur"
          value={variante.couleur || ''}
          onChange={(e) => updateField('couleur', e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Taille"
          value={variante.taille || ''}
          onChange={(e) => updateField('taille', e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Ajustement prix"
          value={variante.prixAjustement}
          onChange={(e) => updateField('prixAjustement', parseInt(e.target.value) || 0)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          min="0"
          value={variante.stock}
          onChange={(e) => updateField('stock', parseInt(e.target.value) || 1)}
          className="p-2 border rounded"
        />
      </div>
    </div>
  );
};