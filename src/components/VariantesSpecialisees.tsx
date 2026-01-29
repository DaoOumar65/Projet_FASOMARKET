import React from 'react';
import { ProduitVarianteComplete } from '../types/variantes';

interface Props {
  variantes: ProduitVarianteComplete[];
  onSelect: (variante: ProduitVarianteComplete) => void;
  selectedVariante?: ProduitVarianteComplete;
}

// Composant spécialisé pour les vêtements
export const VariantesVetements: React.FC<Props> = ({ variantes, onSelect, selectedVariante }) => {
  const couleurs = [...new Set(variantes.map(v => v.couleur).filter(Boolean))];
  const tailles = [...new Set(variantes.map(v => v.taille).filter(Boolean))];
  const genres = [...new Set(variantes.map(v => v.genre).filter(Boolean))];

  return (
    <div className="variantes-vetements space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Couleurs avec aperçu visuel */}
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">Couleur</label>
          <div className="flex flex-wrap gap-3">
            {couleurs.map(couleur => (
              <button
                key={couleur}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  selectedVariante?.couleur === couleur
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => {
                  const variante = variantes.find(v => v.couleur === couleur);
                  if (variante) onSelect(variante);
                }}
              >
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: couleur?.toLowerCase() }}
                />
                {couleur}
              </button>
            ))}
          </div>
        </div>

        {/* Tailles avec guide */}
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">
            Taille
            <button className="ml-2 text-blue-500 text-xs underline">Guide des tailles</button>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {tailles.map(taille => (
              <button
                key={taille}
                className={`py-2 px-3 border rounded-lg text-center transition-colors ${
                  selectedVariante?.taille === taille
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => {
                  const variante = variantes.find(v => v.taille === taille);
                  if (variante) onSelect(variante);
                }}
              >
                {taille}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genre */}
      {genres.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">Genre</label>
          <div className="flex gap-3">
            {genres.map(genre => (
              <button
                key={genre}
                className={`px-6 py-2 border rounded-lg transition-colors ${
                  selectedVariante?.genre === genre
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => {
                  const variante = variantes.find(v => v.genre === genre);
                  if (variante) onSelect(variante);
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant spécialisé pour l'électronique
export const VariantesElectronique: React.FC<Props> = ({ variantes, onSelect, selectedVariante }) => {
  const capacites = [...new Set(variantes.map(v => v.capacite).filter(Boolean))];
  const couleurs = [...new Set(variantes.map(v => v.couleur).filter(Boolean))];
  const modeles = [...new Set(variantes.map(v => v.modele).filter(Boolean))];

  return (
    <div className="variantes-electronique space-y-6">
      {/* Capacité avec prix différentiel */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700">Capacité de stockage</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {capacites.map(capacite => {
            const variante = variantes.find(v => v.capacite === capacite);
            return (
              <button
                key={capacite}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  selectedVariante?.capacite === capacite
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => variante && onSelect(variante)}
              >
                <div className="font-medium">{capacite}</div>
                {variante?.prixAjustement !== 0 && (
                  <div className="text-sm mt-1">
                    {variante?.prixAjustement > 0 ? '+' : ''}{variante?.prixAjustement} FCFA
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Couleur avec aperçu produit */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700">Couleur</label>
        <div className="flex flex-wrap gap-3">
          {couleurs.map(couleur => (
            <button
              key={couleur}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                selectedVariante?.couleur === couleur
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
              onClick={() => {
                const variante = variantes.find(v => v.couleur === couleur);
                if (variante) onSelect(variante);
              }}
            >
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: couleur?.toLowerCase() }}
              />
              {couleur}
            </button>
          ))}
        </div>
      </div>

      {/* Modèles */}
      {modeles.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">Modèle</label>
          <div className="flex flex-wrap gap-3">
            {modeles.map(modele => (
              <button
                key={modele}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  selectedVariante?.modele === modele
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => {
                  const variante = variantes.find(v => v.modele === modele);
                  if (variante) onSelect(variante);
                }}
              >
                {modele}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant spécialisé pour les cosmétiques
export const VariantesCosmetiques: React.FC<Props> = ({ variantes, onSelect, selectedVariante }) => {
  const parfums = [...new Set(variantes.map(v => v.parfum).filter(Boolean))];
  const finitions = [...new Set(variantes.map(v => v.finition).filter(Boolean))];
  const genres = [...new Set(variantes.map(v => v.genre).filter(Boolean))];

  return (
    <div className="variantes-cosmetiques space-y-6">
      {/* Parfums */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700">Parfum</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parfums.map(parfum => (
            <button
              key={parfum}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedVariante?.parfum === parfum
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
              onClick={() => {
                const variante = variantes.find(v => v.parfum === parfum);
                if (variante) onSelect(variante);
              }}
            >
              {parfum}
            </button>
          ))}
        </div>
      </div>

      {/* Finitions */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700">Finition</label>
        <div className="flex gap-3">
          {finitions.map(finition => (
            <button
              key={finition}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                selectedVariante?.finition === finition
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
              onClick={() => {
                const variante = variantes.find(v => v.finition === finition);
                if (variante) onSelect(variante);
              }}
            >
              {finition}
            </button>
          ))}
        </div>
      </div>

      {/* Genre */}
      {genres.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">Genre</label>
          <div className="flex gap-3">
            {genres.map(genre => (
              <button
                key={genre}
                className={`px-6 py-2 border rounded-lg transition-colors ${
                  selectedVariante?.genre === genre
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => {
                  const variante = variantes.find(v => v.genre === genre);
                  if (variante) onSelect(variante);
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};