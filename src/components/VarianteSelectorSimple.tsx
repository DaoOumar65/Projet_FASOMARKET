import React, { useState, useEffect } from 'react';

interface ProduitVariante {
  id: number;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

interface VarianteSelectorProps {
  variantes: ProduitVariante[];
  onVarianteSelect: (variante: ProduitVariante | null) => void;
  selectedVariante?: ProduitVariante | null;
}

export default function VarianteSelector({ variantes, onVarianteSelect, selectedVariante }: VarianteSelectorProps) {
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<string>('');
  const [tailleSelectionnee, setTailleSelectionnee] = useState<string>('');
  const [modeleSelectionne, setModeleSelectionne] = useState<string>('');

  // Obtenir les valeurs uniques
  const couleurs = [...new Set(variantes.map(v => v.couleur).filter(Boolean))];
  const tailles = [...new Set(variantes.map(v => v.taille).filter(Boolean))];
  const modeles = [...new Set(variantes.map(v => v.modele).filter(Boolean))];

  // Trouver la variante correspondante
  useEffect(() => {
    const variante = variantes.find(v => 
      (!couleurSelectionnee || v.couleur === couleurSelectionnee) &&
      (!tailleSelectionnee || v.taille === tailleSelectionnee) &&
      (!modeleSelectionne || v.modele === modeleSelectionne)
    );
    onVarianteSelect(variante || null);
  }, [couleurSelectionnee, tailleSelectionnee, modeleSelectionne, variantes]);

  // Initialiser avec la première variante
  useEffect(() => {
    if (variantes.length > 0 && !selectedVariante) {
      const first = variantes[0];
      setCouleurSelectionnee(first.couleur || '');
      setTailleSelectionnee(first.taille || '');
      setModeleSelectionne(first.modele || '');
    }
  }, [variantes]);

  if (variantes.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Options disponibles
      </h3>

      {/* Couleurs */}
      {couleurs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Couleur
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {couleurs.map(couleur => (
              <button
                key={couleur}
                onClick={() => setCouleurSelectionnee(couleur!)}
                style={{
                  padding: '8px 16px',
                  border: couleurSelectionnee === couleur ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: couleurSelectionnee === couleur ? '#eff6ff' : 'white',
                  color: couleurSelectionnee === couleur ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {couleur}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tailles */}
      {tailles.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Taille
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tailles.map(taille => (
              <button
                key={taille}
                onClick={() => setTailleSelectionnee(taille!)}
                style={{
                  padding: '8px 16px',
                  border: tailleSelectionnee === taille ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: tailleSelectionnee === taille ? '#eff6ff' : 'white',
                  color: tailleSelectionnee === taille ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {taille}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modèles */}
      {modeles.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Modèle
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {modeles.map(modele => (
              <button
                key={modele}
                onClick={() => setModeleSelectionne(modele!)}
                style={{
                  padding: '8px 16px',
                  border: modeleSelectionne === modele ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: modeleSelectionne === modele ? '#eff6ff' : 'white',
                  color: modeleSelectionne === modele ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {modele}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Informations variante sélectionnée */}
      {selectedVariante && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', margin: 0 }}>
                {selectedVariante.prixAjustement.toLocaleString()} FCFA
              </p>
              <p style={{ fontSize: '12px', color: '#0369a1', margin: '2px 0 0 0' }}>
                SKU: {selectedVariante.sku}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: selectedVariante.stock > 5 ? '#059669' : selectedVariante.stock > 0 ? '#d97706' : '#dc2626',
                margin: 0
              }}>
                {selectedVariante.stock > 5 
                  ? `${selectedVariante.stock} en stock` 
                  : selectedVariante.stock > 0 
                    ? `Plus que ${selectedVariante.stock} !` 
                    : 'Stock épuisé'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}