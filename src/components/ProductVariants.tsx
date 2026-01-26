import { useState, useEffect } from 'react';
import { variantesService } from '../services/variantes';

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
  onVariantChange: (variante: ProduitVariante | null, quantite: number) => void;
}

export default function ProductVariants({ produitId, onVariantChange }: ProductVariantsProps) {
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProduitVariante | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerVariantes();
  }, [produitId]);

  const chargerVariantes = async () => {
    try {
      const data = await variantesService.getVariantesProduit(produitId);
      setVariantes(data || []);
      if (data && data.length > 0) {
        setSelectedVariant(data[0]);
        onVariantChange(data[0], quantite);
      }
    } catch (error) {
      console.error('Erreur chargement variantes:', error);
      setVariantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVarianteChange = (variante: ProduitVariante) => {
    setSelectedVariant(variante);
    onVariantChange(variante, quantite);
  };

  if (loading) return <div style={{ padding: '16px', color: '#6b7280' }}>Chargement des variantes...</div>;
  if (variantes.length === 0) return null;

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

  // Grouper les variantes par attributs
  const couleurs = getUniqueValues('couleur');
  const tailles = getUniqueValues('taille');
  const modeles = getUniqueValues('modele');

  const [selectedCouleur, setSelectedCouleur] = useState<string>('');
  const [selectedTaille, setSelectedTaille] = useState<string>('');
  const [selectedModele, setSelectedModele] = useState<string>('');

  useEffect(() => {
    // Trouver la variante correspondante aux sélections
    const variante = variantes.find(v => 
      (!selectedCouleur || v.couleur === selectedCouleur) &&
      (!selectedTaille || v.taille === selectedTaille) &&
      (!selectedModele || v.modele === selectedModele)
    );
    
    setSelectedVariant(variante || null);
    onVariantChange(variante || null, quantite);
  }, [selectedCouleur, selectedTaille, selectedModele, quantite, variantes, onVariantChange]);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ padding: '10px', backgroundColor: '#e3f2fd', marginBottom: '16px', fontSize: '12px' }}>
        ProductVariants: {variantes.length} variantes reçues<br/>
        Couleurs: {couleurs.join(', ') || 'Aucune'}<br/>
        Tailles: {tailles.join(', ') || 'Aucune'}<br/>
        Modèles: {modeles.join(', ') || 'Aucun'}
      </div>
      {/* Couleurs */}
      {couleurs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Couleur
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {couleurs.map(couleur => (
              <button
                key={couleur}
                onClick={() => setSelectedCouleur(couleur)}
                style={{
                  padding: '8px 16px',
                  border: selectedCouleur === couleur ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: selectedCouleur === couleur ? '#eff6ff' : 'white',
                  color: selectedCouleur === couleur ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
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
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Taille
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tailles.map(taille => (
              <button
                key={taille}
                onClick={() => setSelectedTaille(taille)}
                style={{
                  padding: '8px 16px',
                  border: selectedTaille === taille ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: selectedTaille === taille ? '#eff6ff' : 'white',
                  color: selectedTaille === taille ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
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
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Modèle
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {modeles.map(modele => (
              <button
                key={modele}
                onClick={() => setSelectedModele(modele)}
                style={{
                  padding: '8px 16px',
                  border: selectedModele === modele ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: selectedModele === modele ? '#eff6ff' : 'white',
                  color: selectedModele === modele ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {modele}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantité */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Quantité
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setQuantite(Math.max(1, quantite - 1))}
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            -
          </button>
          <span style={{ 
            minWidth: '40px', 
            textAlign: 'center', 
            fontSize: '16px', 
            fontWeight: '600' 
          }}>
            {quantite}
          </span>
          <button
            onClick={() => setQuantite(quantite + 1)}
            disabled={selectedVariant && quantite >= selectedVariant.stock}
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              opacity: selectedVariant && quantite >= selectedVariant.stock ? 0.5 : 1
            }}
          >
            +
          </button>
        </div>
        {selectedVariant && (
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Stock disponible: {selectedVariant.stock}
          </p>
        )}
      </div>

      {/* Prix et stock de la variante sélectionnée */}
      {selectedVariant && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
            <strong>Prix:</strong> {selectedVariant.prixAjustement} FCFA
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#374151' }}>
            <strong>SKU:</strong> {selectedVariant.sku}
          </p>
        </div>
      )}
    </div>
  );
}