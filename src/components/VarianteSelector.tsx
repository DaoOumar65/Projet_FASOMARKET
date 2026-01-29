import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface ProduitVariante {
  id: string;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
}

interface VarianteSelectorProps {
  variantes: ProduitVariante[];
  onVarianteSelect: (variante: ProduitVariante | null) => void;
  selectedVariante?: ProduitVariante | null;
}

export default function VarianteSelector({ variantes, onVarianteSelect, selectedVariante }: VarianteSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<{
    couleur?: string;
    taille?: string;
    modele?: string;
  }>({});

  // Obtenir les valeurs uniques pour chaque attribut
  const getUniqueValues = (field: keyof ProduitVariante): string[] => {
    return [...new Set(variantes.map(v => v[field]).filter(Boolean) as string[])];
  };

  const couleurs = getUniqueValues('couleur');
  const tailles = getUniqueValues('taille');
  const modeles = getUniqueValues('modele');

  // Vérifier si une combinaison d'options est disponible
  const isOptionAvailable = (type: 'couleur' | 'taille' | 'modele', value: string): boolean => {
    const testOptions = { ...selectedOptions, [type]: value };
    return variantes.some(v => 
      v.stock > 0 &&
      (!testOptions.couleur || v.couleur === testOptions.couleur) &&
      (!testOptions.taille || v.taille === testOptions.taille) &&
      (!testOptions.modele || v.modele === testOptions.modele)
    );
  };

  // Trouver la variante correspondante aux options sélectionnées
  const findMatchingVariant = (options: typeof selectedOptions): ProduitVariante | null => {
    return variantes.find(v => 
      (!options.couleur || v.couleur === options.couleur) &&
      (!options.taille || v.taille === options.taille) &&
      (!options.modele || v.modele === options.modele)
    ) || null;
  };

  // Gérer la sélection d'une option
  const handleOptionSelect = (type: 'couleur' | 'taille' | 'modele', value: string) => {
    const newOptions = { ...selectedOptions, [type]: value };
    setSelectedOptions(newOptions);
    
    const matchingVariant = findMatchingVariant(newOptions);
    onVarianteSelect(matchingVariant);
  };

  // Initialiser avec la première variante disponible
  useEffect(() => {
    if (variantes.length > 0 && !selectedVariante) {
      const firstAvailableVariant = variantes.find(v => v.stock > 0) || variantes[0];
      setSelectedOptions({
        couleur: firstAvailableVariant.couleur,
        taille: firstAvailableVariant.taille,
        modele: firstAvailableVariant.modele
      });
      onVarianteSelect(firstAvailableVariant);
    }
  }, [variantes]);

  if (variantes.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '20px' 
      }}>
        Choisissez vos options
      </h3>

      {/* Couleurs */}
      {couleurs.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px' 
          }}>
            Couleur
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {couleurs.map(couleur => {
              const isSelected = selectedOptions.couleur === couleur;
              const isAvailable = isOptionAvailable('couleur', couleur);
              
              return (
                <button
                  key={couleur}
                  onClick={() => isAvailable && handleOptionSelect('couleur', couleur)}
                  disabled={!isAvailable}
                  style={{
                    position: 'relative',
                    padding: '12px 20px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    color: isSelected ? '#2563eb' : isAvailable ? '#374151' : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isAvailable ? 1 : 0.5,
                    minWidth: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {couleur}
                  {isSelected && <Check size={16} />}
                  {!isAvailable && <AlertCircle size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tailles */}
      {tailles.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px' 
          }}>
            Taille
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {tailles.map(taille => {
              const isSelected = selectedOptions.taille === taille;
              const isAvailable = isOptionAvailable('taille', taille);
              
              return (
                <button
                  key={taille}
                  onClick={() => isAvailable && handleOptionSelect('taille', taille)}
                  disabled={!isAvailable}
                  style={{
                    position: 'relative',
                    padding: '12px 20px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    color: isSelected ? '#2563eb' : isAvailable ? '#374151' : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isAvailable ? 1 : 0.5,
                    minWidth: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {taille}
                  {isSelected && <Check size={16} />}
                  {!isAvailable && <AlertCircle size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modèles */}
      {modeles.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px' 
          }}>
            Modèle
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {modeles.map(modele => {
              const isSelected = selectedOptions.modele === modele;
              const isAvailable = isOptionAvailable('modele', modele);
              
              return (
                <button
                  key={modele}
                  onClick={() => isAvailable && handleOptionSelect('modele', modele)}
                  disabled={!isAvailable}
                  style={{
                    position: 'relative',
                    padding: '12px 20px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    color: isSelected ? '#2563eb' : isAvailable ? '#374151' : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isAvailable ? 1 : 0.5,
                    minWidth: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {modele}
                  {isSelected && <Check size={16} />}
                  {!isAvailable && <AlertCircle size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Informations sur la sélection */}
      {selectedVariante && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '1px solid #0ea5e9',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#0c4a6e',
                margin: '0 0 4px 0'
              }}>
                {selectedVariante.prixAjustement.toLocaleString()} FCFA
              </p>
              <p style={{ 
                fontSize: '13px', 
                color: '#0369a1',
                margin: 0
              }}>
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

      {/* Message si aucune variante sélectionnée */}
      {!selectedVariante && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          marginTop: '16px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#92400e',
            margin: 0,
            textAlign: 'center'
          }}>
            Veuillez sélectionner toutes les options pour continuer
          </p>
        </div>
      )}
    </div>
  );
}