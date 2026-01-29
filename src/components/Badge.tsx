interface BadgeProps {
  children: React.ReactNode;
  variant?: 'couleur' | 'taille' | 'modele' | 'capacite' | 'puissance' | 'prix' | 'stock' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const badgeStyles = {
  couleur: { bg: '#dbeafe', color: '#2563eb' },
  taille: { bg: '#dcfce7', color: '#16a34a' },
  modele: { bg: '#fef3c7', color: '#d97706' },
  capacite: { bg: '#f3e8ff', color: '#7c3aed' },
  puissance: { bg: '#fce7f3', color: '#be185d' },
  prix: { bg: '#fee2e2', color: '#dc2626' },
  stock: { bg: '#ecfdf5', color: '#059669' },
  default: { bg: '#f3f4f6', color: '#374151' }
};

const sizeStyles = {
  sm: { padding: '2px 6px', fontSize: '11px' },
  md: { padding: '4px 8px', fontSize: '12px' },
  lg: { padding: '6px 12px', fontSize: '14px' }
};

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantStyle = badgeStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <span style={{
      ...sizeStyle,
      backgroundColor: variantStyle.bg,
      color: variantStyle.color,
      borderRadius: '6px',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
}