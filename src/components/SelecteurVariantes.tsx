import { useState } from 'react';
import Badge from './Badge';
import '../styles/variantes.css';
import type { ProduitVarianteComplete } from '../types';

interface Props {
  variantes: ProduitVarianteComplete[];
  prixBase: number;
  onVarianteChange: (variante: ProduitVarianteComplete | null) => void;
  selectedVariante?: ProduitVarianteComplete | null;
}

export default function SelecteurVariantes({ variantes, prixBase, onVarianteChange, selectedVariante }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<{
    couleur?: string;
    taille?: string;
    modele?: string;
    capacite?: string;
    puissance?: string;
  }>({});

  // Extraire les options uniques
  const couleurs = [...new Set(variantes.map(v => v.couleur).filter(Boolean))];
  const tailles = [...new Set(variantes.map(v => v.taille).filter(Boolean))];
  const modeles = [...new Set(variantes.map(v => v.modele).filter(Boolean))];
  const capacites = [...new Set(variantes.map(v => v.capacite).filter(Boolean))];
  const puissances = [...new Set(variantes.map(v => v.puissance).filter(Boolean))];

  const handleOptionSelect = (type: string, value: string) => {
    const newOptions = { ...selectedOptions, [type]: value };
    setSelectedOptions(newOptions);

    // Trouver la variante correspondante
    const variante = variantes.find(v => 
      (!newOptions.couleur || v.couleur === newOptions.couleur) &&
      (!newOptions.taille || v.taille === newOptions.taille) &&
      (!newOptions.modele || v.modele === newOptions.modele) &&
      (!newOptions.capacite || v.capacite === newOptions.capacite) &&
      (!newOptions.puissance || v.puissance === newOptions.puissance)
    );

    onVarianteChange(variante || null);
  };

  const OptionSelector = ({ label, options, type, variant }: {
    label: string;
    options: string[];
    type: string;
    variant: 'couleur' | 'taille' | 'modele' | 'capacite' | 'puissance';
  }) => {
    if (options.length <= 1) return null;

    return (
      <div className="variante-option-group">
        <label className="variante-option-label">{label}</label>
        <div className="variante-options">
          {options.map(option => (
            <button
              key={option}
              onClick={() => handleOptionSelect(type, option)}
              className={`variante-option-btn ${
                selectedOptions[type as keyof typeof selectedOptions] === option ? 'selected' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const calculerPrixFinal = () => {
    if (!selectedVariante) return prixBase;
    return prixBase + (selectedVariante.prixAjustement || 0);
  };

  return (
    <div className="variante-selector">
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🎯 Choisir les options
      </h3>

      <OptionSelector label="Couleur" options={couleurs} type="couleur" variant="couleur" />
      <OptionSelector label="Taille" options={tailles} type="taille" variant="taille" />
      <OptionSelector label="Modèle" options={modeles} type="modele" variant="modele" />
      <OptionSelector label="Capacité" options={capacites} type="capacite" variant="capacite" />
      <OptionSelector label="Puissance" options={puissances} type="puissance" variant="puissance" />

      {selectedVariante && (
        <div className="variante-summary">
          <div className="variante-summary-header">
            <span className="variante-summary-label">Configuration sélectionnée</span>
            <div className="variante-summary-badges">
              {selectedVariante.couleur && <Badge variant="couleur" size="sm">{selectedVariante.couleur}</Badge>}
              {selectedVariante.taille && <Badge variant="taille" size="sm">{selectedVariante.taille}</Badge>}
              {selectedVariante.modele && <Badge variant="modele" size="sm">{selectedVariante.modele}</Badge>}
              {selectedVariante.capacite && <Badge variant="capacite" size="sm">{selectedVariante.capacite}</Badge>}
              {selectedVariante.puissance && <Badge variant="puissance" size="sm">{selectedVariante.puissance}</Badge>}
            </div>
          </div>
          
          <div className="variante-summary-footer">
            <div>
              <span className="variante-price">
                {calculerPrixFinal().toLocaleString()} FCFA
              </span>
              {selectedVariante.prixAjustement !== 0 && (
                <Badge variant="prix" size="sm" style={{ marginLeft: '8px' }}>
                  {selectedVariante.prixAjustement > 0 ? '+' : ''}{selectedVariante.prixAjustement.toLocaleString()}
                </Badge>
              )}
            </div>
            <Badge 
              variant={selectedVariante.stock > 10 ? 'stock' : selectedVariante.stock > 0 ? 'modele' : 'prix'}
            >
              {selectedVariante.stock > 10 ? `${selectedVariante.stock} en stock` : 
               selectedVariante.stock > 0 ? `${selectedVariante.stock} restant(s)` : 'Rupture de stock'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}