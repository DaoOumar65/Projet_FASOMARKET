import { useState, useEffect } from 'react';
import { publicService } from '../services/api';

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
  produitId: string;
  onVarianteChange?: (variante: ProduitVariante | null) => void;
}

export default function VarianteSelector({ produitId, onVarianteChange }: VarianteSelectorProps) {
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [varianteSelectionnee, setVarianteSelectionnee] = useState<ProduitVariante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerVariantes();
  }, [produitId]);

  const chargerVariantes = async () => {
    try {
      const response = await publicService.getProduitVariantes(produitId);
      const data = response.data || [];
      setVariantes(data);
      if (data.length > 0) {
        setVarianteSelectionnee(data[0]);
        onVarianteChange?.(data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement variantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVarianteChange = (variante: ProduitVariante) => {
    setVarianteSelectionnee(variante);
    onVarianteChange?.(variante);
  };

  const getUniqueValues = (field: keyof ProduitVariante): string[] => {
    return [...new Set(variantes.map(v => v[field]).filter(Boolean) as string[])];
  };

  const selectByCouleur = (couleur: string) => {
    const variante = variantes.find(v => v.couleur === couleur);
    if (variante) handleVarianteChange(variante);
  };

  const selectByTaille = (taille: string) => {
    const variante = variantes.find(v => v.taille === taille);
    if (variante) handleVarianteChange(variante);
  };

  const selectByModele = (modele: string) => {
    const variante = variantes.find(v => v.modele === modele);
    if (variante) handleVarianteChange(variante);
  };

  if (loading) return <div style={{ padding: '16px', color: '#6b7280' }}>Chargement des variantes...</div>;
  if (variantes.length === 0) return null;

  const couleurs = getUniqueValues('couleur');
  const tailles = getUniqueValues('taille');
  const modeles = getUniqueValues('modele');

  return (
    <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Choisir une variante</h4>
      
      {/* Couleurs */}
      {couleurs.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Couleur:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {couleurs.map(couleur => (
              <button
                key={couleur}
                onClick={() => selectByCouleur(couleur)}
                style={{
                  padding: '8px 16px',
                  border: varianteSelectionnee?.couleur === couleur ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  backgroundColor: varianteSelectionnee?.couleur === couleur ? '#2563eb' : 'white',
                  color: varianteSelectionnee?.couleur === couleur ? 'white' : '#374151',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {couleur}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tailles */}
      {tailles.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Taille:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tailles.map(taille => (
              <button
                key={taille}
                onClick={() => selectByTaille(taille)}
                style={{
                  padding: '8px 16px',
                  border: varianteSelectionnee?.taille === taille ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  backgroundColor: varianteSelectionnee?.taille === taille ? '#2563eb' : 'white',
                  color: varianteSelectionnee?.taille === taille ? 'white' : '#374151',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {taille}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modèles */}
      {modeles.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Modèle:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {modeles.map(modele => (
              <button
                key={modele}
                onClick={() => selectByModele(modele)}
                style={{
                  padding: '8px 16px',
                  border: varianteSelectionnee?.modele === modele ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  backgroundColor: varianteSelectionnee?.modele === modele ? '#2563eb' : 'white',
                  color: varianteSelectionnee?.modele === modele ? 'white' : '#374151',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {modele}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info variante sélectionnée */}
      {varianteSelectionnee && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0369a1' }}>
            <strong>Stock:</strong> {varianteSelectionnee.stock} disponible{varianteSelectionnee.stock > 1 ? 's' : ''}
          </p>
          {varianteSelectionnee.prixAjustement > 0 && (
            <p style={{ margin: '0', fontSize: '14px', color: '#0369a1' }}>
              <strong>Prix ajusté:</strong> +{varianteSelectionnee.prixAjustement.toLocaleString()} FCFA
            </p>
          )}
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            SKU: {varianteSelectionnee.sku}
          </p>
        </div>
      )}
    </div>
  );
}