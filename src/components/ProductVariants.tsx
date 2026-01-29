import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

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

interface ProductVariantsProps {
  produitId: string;
  variantes: ProduitVariante[];
  onVariantChange: (variante: ProduitVariante | null, quantite: number) => void;
}

export default function ProductVariants({ produitId, variantes, onVariantChange }: ProductVariantsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProduitVariante | null>(null);
  const [quantite, setQuantite] = useState(1);
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
    setSelectedVariant(matchingVariant);
    
    // Réinitialiser la quantité si nouvelle variante
    if (matchingVariant && matchingVariant.id !== selectedVariant?.id) {
      setQuantite(1);
      onVariantChange(matchingVariant, 1);
    } else {
      onVariantChange(matchingVariant, quantite);
    }
  };

  // Gérer le changement de quantité
  const handleQuantiteChange = (newQuantite: number) => {
    const maxStock = selectedVariant?.stock || 0;
    const validQuantite = Math.max(1, Math.min(newQuantite, maxStock));
    setQuantite(validQuantite);
    onVariantChange(selectedVariant, validQuantite);
  };

  // Initialiser avec la première variante disponible
  useEffect(() => {
    if (variantes.length > 0 && !selectedVariant) {
      const firstVariant = variantes[0];
      setSelectedVariant(firstVariant);
      setSelectedOptions({
        couleur: firstVariant.couleur,
        taille: firstVariant.taille,
        modele: firstVariant.modele
      });
      onVariantChange(firstVariant, quantite);
    }
  }, [variantes]);

  if (variantes.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Couleurs */}
      {couleurs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '12px' 
          }}>
            Couleur
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {couleurs.map(couleur => {
              const isSelected = selectedOptions.couleur === couleur;
              const isAvailable = variantes.some(v => 
                v.couleur === couleur && 
                v.stock > 0 &&
                (!selectedOptions.taille || v.taille === selectedOptions.taille) &&
                (!selectedOptions.modele || v.modele === selectedOptions.modele)
              );
              
              return (
                <button
                  key={couleur}
                  onClick={() => handleOptionSelect('couleur', couleur)}
                  disabled={!isAvailable}
                  style={{
                    padding: '12px 20px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    color: isSelected ? '#2563eb' : isAvailable ? '#374151' : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isAvailable ? 1 : 0.5
                  }}
                >
                  {couleur}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tailles */}
      {tailles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '12px' 
          }}>
            Taille
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {tailles.map(taille => {
              const isSelected = selectedOptions.taille === taille;
              const isAvailable = variantes.some(v => 
                v.taille === taille && 
                v.stock > 0 &&
                (!selectedOptions.couleur || v.couleur === selectedOptions.couleur) &&
                (!selectedOptions.modele || v.modele === selectedOptions.modele)
              );
              
              return (
                <button
                  key={taille}
                  onClick={() => handleOptionSelect('taille', taille)}
                  disabled={!isAvailable}
                  style={{
                    padding: '12px 20px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    color: isSelected ? '#2563eb' : isAvailable ? '#374151' : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isAvailable ? 1 : 0.5
                  }}
                >
                  {taille}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modèles */}
      {modeles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '12px' 
          }}>
            Modèle
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {modeles.map(modele => {
              const isSelected = selectedOptions.modele === modele;
              const isAvailable = variantes.some(v => 
                v.modele === modele && 
                v.stock > 0 &&
                (!selectedOptions.couleur || v.couleur === selectedOptions.couleur) &&
                (!selectedOptions.taille || v.taille === selectedOptions.taille)
              );
              
              return (
                <button
                  key={modele}
                  onClick={() => handleOptionSelect('modele', modele)}
                  disabled={!isAvailable}
                  style={{
                    padding: '12px 20px',
                    border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    color: isSelected ? '#2563eb' : isAvailable ? '#374151' : '#9ca3af',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isAvailable ? 1 : 0.5
                  }}
                >
                  {modele}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantité */}
      {selectedVariant && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#111827',
            marginBottom: '12px' 
          }}>
            Quantité
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => handleQuantiteChange(quantite - 1)}
              disabled={quantite <= 1}
              style={{
                width: '44px',
                height: '44px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: quantite <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: quantite <= 1 ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <Minus size={18} color={quantite <= 1 ? '#9ca3af' : '#374151'} />
            </button>
            
            <span style={{ 
              minWidth: '60px', 
              textAlign: 'center', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#111827'
            }}>
              {quantite}
            </span>
            
            <button
              onClick={() => handleQuantiteChange(quantite + 1)}
              disabled={quantite >= selectedVariant.stock}
              style={{
                width: '44px',
                height: '44px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: quantite >= selectedVariant.stock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: quantite >= selectedVariant.stock ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={18} color={quantite >= selectedVariant.stock ? '#9ca3af' : '#374151'} />
            </button>
          </div>
          
          <p style={{ 
            fontSize: '14px', 
            color: selectedVariant.stock > 5 ? '#10b981' : selectedVariant.stock > 0 ? '#f59e0b' : '#ef4444', 
            marginTop: '8px',
            fontWeight: '500'
          }}>
            {selectedVariant.stock > 5 
              ? `${selectedVariant.stock} en stock` 
              : selectedVariant.stock > 0 
                ? `Plus que ${selectedVariant.stock} en stock !` 
                : 'Stock épuisé'
            }
          </p>
        </div>
      )}

      {/* Résumé de la variante sélectionnée */}
      {selectedVariant && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              Variante sélectionnée
            </h4>
            <span style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2563eb'
            }}>
              {selectedVariant.prixAjustement.toLocaleString()} FCFA
            </span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            {selectedVariant.couleur && (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {selectedVariant.couleur}
              </span>
            )}
            {selectedVariant.taille && (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {selectedVariant.taille}
              </span>
            )}
            {selectedVariant.modele && (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {selectedVariant.modele}
              </span>
            )}
          </div>
          
          <p style={{ 
            fontSize: '13px', 
            color: '#6b7280', 
            margin: 0,
            fontFamily: 'monospace'
          }}>
            SKU: {selectedVariant.sku}
          </p>
        </div>
      )}
    </div>
  );
}