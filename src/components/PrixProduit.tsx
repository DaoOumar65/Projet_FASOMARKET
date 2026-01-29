import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProduitVariante {
  id: string;
  prixAjustement: number;
  stock: number;
}

interface PrixProduitProps {
  prixBase: number;
  selectedVariante?: ProduitVariante | null;
  variantes?: ProduitVariante[];
  showRange?: boolean;
  size?: 'small' | 'medium' | 'large';
  showComparison?: boolean;
}

export default function PrixProduit({ 
  prixBase, 
  selectedVariante, 
  variantes = [], 
  showRange = false,
  size = 'medium',
  showComparison = true
}: PrixProduitProps) {
  
  const getCurrentPrice = (): number => {
    return selectedVariante ? selectedVariante.prixAjustement : prixBase;
  };

  const getPriceRange = (): { min: number; max: number } | null => {
    if (!variantes.length) return null;
    
    const prices = variantes.map(v => v.prixAjustement);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const getPriceComparison = (): { type: 'increase' | 'decrease' | 'same'; percentage: number } | null => {
    if (!selectedVariante || !showComparison) return null;
    
    const currentPrice = selectedVariante.prixAjustement;
    const difference = currentPrice - prixBase;
    
    if (difference === 0) return { type: 'same', percentage: 0 };
    
    const percentage = Math.abs((difference / prixBase) * 100);
    return {
      type: difference > 0 ? 'increase' : 'decrease',
      percentage: Math.round(percentage * 100) / 100
    };
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          currentPrice: { fontSize: '18px', fontWeight: '600' },
          basePrice: { fontSize: '14px' },
          range: { fontSize: '14px' },
          comparison: { fontSize: '12px' }
        };
      case 'large':
        return {
          currentPrice: { fontSize: '48px', fontWeight: 'bold' },
          basePrice: { fontSize: '20px' },
          range: { fontSize: '18px' },
          comparison: { fontSize: '14px' }
        };
      default: // medium
        return {
          currentPrice: { fontSize: '32px', fontWeight: 'bold' },
          basePrice: { fontSize: '16px' },
          range: { fontSize: '16px' },
          comparison: { fontSize: '13px' }
        };
    }
  };

  const styles = getSizeStyles();
  const currentPrice = getCurrentPrice();
  const priceRange = getPriceRange();
  const comparison = getPriceComparison();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Prix principal */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{
          ...styles.currentPrice,
          color: '#2563eb'
        }}>
          {currentPrice.toLocaleString()} FCFA
        </span>
        
        {/* Indicateur de changement de prix */}
        {comparison && comparison.type !== 'same' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: comparison.type === 'increase' ? '#fef3c7' : '#d1fae5',
            color: comparison.type === 'increase' ? '#92400e' : '#065f46'
          }}>
            {comparison.type === 'increase' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span style={{ ...styles.comparison, fontWeight: '500' }}>
              {comparison.percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Prix de base barré si différent */}
      {selectedVariante && selectedVariante.prixAjustement !== prixBase && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            ...styles.basePrice,
            color: '#6b7280',
            textDecoration: 'line-through'
          }}>
            Prix de base: {prixBase.toLocaleString()} FCFA
          </span>
        </div>
      )}

      {/* Plage de prix pour les variantes */}
      {showRange && priceRange && priceRange.min !== priceRange.max && !selectedVariante && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <span style={{
            ...styles.range,
            color: '#374151'
          }}>
            De {priceRange.min.toLocaleString()} à {priceRange.max.toLocaleString()} FCFA
          </span>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>
            Selon les options choisies
          </p>
        </div>
      )}

      {/* Économies potentielles */}
      {priceRange && selectedVariante && selectedVariante.prixAjustement < priceRange.max && (
        <div style={{
          padding: '6px 10px',
          backgroundColor: '#ecfdf5',
          borderRadius: '6px',
          border: '1px solid #10b981'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#065f46',
            fontWeight: '500'
          }}>
            Vous économisez {(priceRange.max - selectedVariante.prixAjustement).toLocaleString()} FCFA
          </span>
        </div>
      )}

      {/* Stock warning pour variante sélectionnée */}
      {selectedVariante && selectedVariante.stock <= 3 && selectedVariante.stock > 0 && (
        <div style={{
          padding: '6px 10px',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          border: '1px solid #f59e0b'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#92400e',
            fontWeight: '500'
          }}>
            Plus que {selectedVariante.stock} en stock à ce prix !
          </span>
        </div>
      )}
    </div>
  );
}