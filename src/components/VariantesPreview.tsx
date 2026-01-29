import Badge from './Badge';
import type { ProduitVarianteComplete } from '../types';

interface Props {
  variantes: ProduitVarianteComplete[];
  maxDisplay?: number;
  size?: 'sm' | 'md';
}

export default function VariantesPreview({ variantes, maxDisplay = 3, size = 'sm' }: Props) {
  if (!variantes || variantes.length === 0) return null;

  // Extraire les options uniques
  const couleurs = [...new Set(variantes.map(v => v.couleur).filter(Boolean))];
  const tailles = [...new Set(variantes.map(v => v.taille).filter(Boolean))];
  const modeles = [...new Set(variantes.map(v => v.modele).filter(Boolean))];
  const capacites = [...new Set(variantes.map(v => v.capacite).filter(Boolean))];
  const puissances = [...new Set(variantes.map(v => v.puissance).filter(Boolean))];

  const allOptions = [
    ...couleurs.map(c => ({ type: 'couleur', value: c })),
    ...tailles.map(t => ({ type: 'taille', value: t })),
    ...modeles.map(m => ({ type: 'modele', value: m })),
    ...capacites.map(c => ({ type: 'capacite', value: c })),
    ...puissances.map(p => ({ type: 'puissance', value: p }))
  ];

  const displayOptions = allOptions.slice(0, maxDisplay);
  const remainingCount = allOptions.length - maxDisplay;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '4px', 
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      {displayOptions.map((option, index) => (
        <Badge 
          key={`${option.type}-${option.value}-${index}`}
          variant={option.type as any} 
          size={size}
        >
          {option.value}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="default" size={size}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}