import { useState, useEffect } from 'react';
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

interface GestionVariantesCompleteProps {
  categorieId: string;
  categorieNom: string;
  variantes: VariantePersonnalisee[];
  onChange: (variantes: VariantePersonnalisee[]) => void;
  stockGlobal: number;
}

export default function GestionVariantesComplete({ 
  categorieId, 
  categorieNom, 
  variantes, 
  onChange,
  stockGlobal 
}: GestionVariantesCompleteProps) {
  const [nouvelleVariante, setNouvelleVariante] = useState<VariantePersonnalisee>({
    prixAjustement: 0,
    stock: 0
  });

  // Calculer le stock total des variantes
  const stockVariantesTotal = variantes.reduce((total, v) => total + (v.stock || 0), 0);
  const stockRestant = stockGlobal - stockVariantesTotal;

  const ajouterVariante = () => {
    if (nouvelleVariante.stock <= 0) {
      alert('Le stock doit être supérieur à 0');
      return;
    }
    
    if (nouvelleVariante.stock > stockRestant) {
      alert(`Stock insuffisant. Disponible: ${stockRestant}`);
      return;
    }
    
    onChange([...variantes, { ...nouvelleVariante }]);
    setNouvelleVariante({ prixAjustement: 0, stock: 0 });
  };

  const supprimerVariante = (index: number) => {
    onChange(variantes.filter((_, i) => i !== index));
  };

  const updateNouvelleVariante = (field: keyof VariantePersonnalisee, value: string | number) => {
    setNouvelleVariante({ ...nouvelleVariante, [field]: value });
  };

  if (!categorieId) return null;

  return (
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} />
          Variantes - {categorieNom}
        </h2>
        <div style={{ fontSize: '14px', color: stockRestant < 0 ? '#dc2626' : '#16a34a', fontWeight: '500' }}>
          Stock restant: {stockRestant} / {stockGlobal}
        </div>
      </div>

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
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: `1px solid ${stockRestant <= 0 ? '#dc2626' : '#e5e7eb'}`, 
                borderRadius: '6px', 
                fontSize: '14px' 
              }}
              placeholder="10"
              min="0"
              max={stockRestant}
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
  );
}