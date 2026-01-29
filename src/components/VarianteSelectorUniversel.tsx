import React, { useState, useEffect } from 'react';
import { ProduitVarianteComplete, VarianteOptions, VarianteSelection } from '../types/variantes';
import { api } from '../services/api';

interface Props {
  produitId: string;
  categorie: string;
  prixBase: number;
  onVarianteChange: (variante: ProduitVarianteComplete | null, prixTotal: number) => void;
}

export const VarianteSelectorUniversel: React.FC<Props> = ({ 
  produitId, 
  categorie, 
  prixBase, 
  onVarianteChange 
}) => {
  const [variantes, setVariantes] = useState<ProduitVarianteComplete[]>([]);
  const [selection, setSelection] = useState<VarianteSelection>({});
  const [options, setOptions] = useState<VarianteOptions>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVariantes = async () => {
      try {
        const data = await api.getVariantesProduit(produitId);
        setVariantes(data);
        
        // Extraire les options disponibles
        const opts: VarianteOptions = {
          couleurs: [...new Set(data.map(v => v.couleur).filter(Boolean))],
          tailles: [...new Set(data.map(v => v.taille).filter(Boolean))],
          modeles: [...new Set(data.map(v => v.modele).filter(Boolean))],
          materiaux: [...new Set(data.map(v => v.materiau).filter(Boolean))],
          finitions: [...new Set(data.map(v => v.finition).filter(Boolean))],
          capacites: [...new Set(data.map(v => v.capacite).filter(Boolean))],
          parfums: [...new Set(data.map(v => v.parfum).filter(Boolean))],
          genres: [...new Set(data.map(v => v.genre).filter(Boolean))],
          saisons: [...new Set(data.map(v => v.saison).filter(Boolean))]
        };
        setOptions(opts);
      } catch (error) {
        console.error('Erreur chargement variantes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVariantes();
  }, [produitId]);

  useEffect(() => {
    // Trouver la variante correspondante
    const variante = variantes.find(v => 
      (!selection.couleur || v.couleur === selection.couleur) &&
      (!selection.taille || v.taille === selection.taille) &&
      (!selection.modele || v.modele === selection.modele) &&
      (!selection.materiau || v.materiau === selection.materiau) &&
      (!selection.finition || v.finition === selection.finition) &&
      (!selection.capacite || v.capacite === selection.capacite) &&
      (!selection.parfum || v.parfum === selection.parfum) &&
      (!selection.genre || v.genre === selection.genre) &&
      (!selection.saison || v.saison === selection.saison)
    );
    
    const prixTotal = variante 
      ? prixBase + variante.prixAjustement 
      : prixBase;
    
    onVarianteChange(variante || null, prixTotal);
  }, [selection, variantes, prixBase, onVarianteChange]);

  const renderSelector = (
    label: string, 
    options: string[] | undefined, 
    value: string | undefined, 
    onChange: (value: string) => void
  ) => {
    if (!options || options.length === 0) return null;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                value === option 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="variante-selector-universel space-y-4">
      {renderSelector('Couleur', options.couleurs, selection.couleur, 
        (couleur) => setSelection(prev => ({ ...prev, couleur })))}
      
      {renderSelector('Taille', options.tailles, selection.taille,
        (taille) => setSelection(prev => ({ ...prev, taille })))}
      
      {renderSelector('Modèle', options.modeles, selection.modele,
        (modele) => setSelection(prev => ({ ...prev, modele })))}
      
      {renderSelector('Matériau', options.materiaux, selection.materiau,
        (materiau) => setSelection(prev => ({ ...prev, materiau })))}
      
      {renderSelector('Finition', options.finitions, selection.finition,
        (finition) => setSelection(prev => ({ ...prev, finition })))}
      
      {renderSelector('Capacité', options.capacites, selection.capacite,
        (capacite) => setSelection(prev => ({ ...prev, capacite })))}
      
      {renderSelector('Parfum', options.parfums, selection.parfum,
        (parfum) => setSelection(prev => ({ ...prev, parfum })))}
      
      {renderSelector('Genre', options.genres, selection.genre,
        (genre) => setSelection(prev => ({ ...prev, genre })))}
      
      {renderSelector('Saison', options.saisons, selection.saison,
        (saison) => setSelection(prev => ({ ...prev, saison })))}
    </div>
  );
};