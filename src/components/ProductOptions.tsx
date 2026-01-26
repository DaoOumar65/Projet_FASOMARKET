import { useState } from 'react';

interface ProductOptionsProps {
  couleurs?: string[];
  tailles?: string[];
  modeles?: string[];
  onSelectionChange: (selection: {
    couleurSelectionnee?: string;
    tailleSelectionnee?: string;
    modeleSelectionne?: string;
  }) => void;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  couleurs = [],
  tailles = [],
  modeles = [],
  onSelectionChange
}) => {
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<string>('');
  const [tailleSelectionnee, setTailleSelectionnee] = useState<string>('');
  const [modeleSelectionne, setModeleSelectionne] = useState<string>('');

  const handleSelection = (type: string, value: string) => {
    const newSelection = { couleurSelectionnee, tailleSelectionnee, modeleSelectionne };
    
    if (type === 'couleur') {
      setCouleurSelectionnee(value);
      newSelection.couleurSelectionnee = value;
    } else if (type === 'taille') {
      setTailleSelectionnee(value);
      newSelection.tailleSelectionnee = value;
    } else if (type === 'modele') {
      setModeleSelectionne(value);
      newSelection.modeleSelectionne = value;
    }
    
    onSelectionChange(newSelection);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {couleurs.length > 0 && (
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Couleur
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {couleurs.map((couleur) => (
              <button
                key={couleur}
                onClick={() => handleSelection('couleur', couleur)}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${couleurSelectionnee === couleur ? '#2563eb' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  backgroundColor: couleurSelectionnee === couleur ? '#eff6ff' : 'white',
                  color: couleurSelectionnee === couleur ? '#2563eb' : '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {couleur}
              </button>
            ))}
          </div>
        </div>
      )}

      {tailles.length > 0 && (
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Taille
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tailles.map((taille) => (
              <button
                key={taille}
                onClick={() => handleSelection('taille', taille)}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${tailleSelectionnee === taille ? '#2563eb' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  backgroundColor: tailleSelectionnee === taille ? '#eff6ff' : 'white',
                  color: tailleSelectionnee === taille ? '#2563eb' : '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {taille}
              </button>
            ))}
          </div>
        </div>
      )}

      {modeles.length > 0 && (
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Modèle
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {modeles.map((modele) => (
              <button
                key={modele}
                onClick={() => handleSelection('modele', modele)}
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${modeleSelectionne === modele ? '#2563eb' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  backgroundColor: modeleSelectionne === modele ? '#eff6ff' : 'white',
                  color: modeleSelectionne === modele ? '#2563eb' : '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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

export default ProductOptions;