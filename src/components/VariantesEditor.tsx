import { useState } from 'react';
import { Plus, X, Settings } from 'lucide-react';

export interface VariantePersonnalisee {
  couleur?: string;
  taille?: string;
  modele?: string;
  capacite?: string;
  parfum?: string;
  finition?: string;
  genre?: string;
  prixAjustement: number;
  stock: number;
}

interface VariantesEditorProps {
  categorieId: string;
  onVariantesChange: (variantes: VariantePersonnalisee[], utiliserDefaut: boolean) => void;
}

export default function VariantesEditor({ categorieId, onVariantesChange }: VariantesEditorProps) {
  const [utiliserDefaut, setUtiliserDefaut] = useState(true);
  const [variantes, setVariantes] = useState<VariantePersonnalisee[]>([]);
  const [nouvelleVariante, setNouvelleVariante] = useState<VariantePersonnalisee>({
    prixAjustement: 0,
    stock: 0
  });

  const handleToggleDefaut = (checked: boolean) => {
    setUtiliserDefaut(checked);
    onVariantesChange(variantes, checked);
  };

  const ajouterVariante = () => {
    const nouvelle = { ...nouvelleVariante };
    setVariantes([...variantes, nouvelle]);
    setNouvelleVariante({ prixAjustement: 0, stock: 0 });
    onVariantesChange([...variantes, nouvelle], utiliserDefaut);
  };

  const supprimerVariante = (index: number) => {
    const nouvelles = variantes.filter((_, i) => i !== index);
    setVariantes(nouvelles);
    onVariantesChange(nouvelles, utiliserDefaut);
  };

  const updateNouvelleVariante = (field: keyof VariantePersonnalisee, value: string | number) => {
    setNouvelleVariante({ ...nouvelleVariante, [field]: value });
  };

  if (!categorieId) return null;

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={20} />
        Gestion des variantes
      </h2>

      {/* Toggle pour variantes par défaut */}
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={utiliserDefaut}
            onChange={(e) => handleToggleDefaut(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <div>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Utiliser les variantes par défaut de la catégorie
            </span>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Les variantes seront générées automatiquement selon la catégorie sélectionnée
            </p>
          </div>
        </label>
      </div>

      {/* Section variantes personnalisées */}
      {!utiliserDefaut && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>
            Variantes personnalisées
          </h3>

          {/* Formulaire nouvelle variante */}
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Couleur</label>
                <input
                  type="text"
                  value={nouvelleVariante.couleur || ''}
                  onChange={(e) => updateNouvelleVariante('couleur', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="Rouge"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Taille</label>
                <input
                  type="text"
                  value={nouvelleVariante.taille || ''}
                  onChange={(e) => updateNouvelleVariante('taille', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="M"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Modèle</label>
                <input
                  type="text"
                  value={nouvelleVariante.modele || ''}
                  onChange={(e) => updateNouvelleVariante('modele', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="Pro"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Prix ajustement (FCFA)</label>
                <input
                  type="number"
                  value={nouvelleVariante.prixAjustement}
                  onChange={(e) => updateNouvelleVariante('prixAjustement', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="0"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Stock</label>
                <input
                  type="number"
                  value={nouvelleVariante.stock}
                  onChange={(e) => updateNouvelleVariante('stock', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="10"
                  min="0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={ajouterVariante}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Ajouter variante
            </button>
          </div>

          {/* Liste des variantes */}
          {variantes.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '12px' }}>
                Variantes créées ({variantes.length})
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {variantes.map((variante, index) => (
                  <div key={index} style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                      {variante.couleur && <span style={{ color: '#2563eb' }}>Couleur: {variante.couleur}</span>}
                      {variante.taille && <span style={{ color: '#16a34a' }}>Taille: {variante.taille}</span>}
                      {variante.modele && <span style={{ color: '#dc2626' }}>Modèle: {variante.modele}</span>}
                      <span style={{ color: '#6b7280' }}>Prix: +{variante.prixAjustement} FCFA</span>
                      <span style={{ color: '#6b7280' }}>Stock: {variante.stock}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => supprimerVariante(index)}
                      style={{
                        padding: '4px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}