import Badge from './Badge';

interface ArticleCommandeProps {
  item: {
    id?: string;
    produit?: {
      nom?: string;
      images?: string[];
      prix?: number;
    };
    variante?: {
      couleur?: string;
      taille?: string;
      modele?: string;
      capacite?: string;
      puissance?: string;
      prixAjustement?: number;
    };
    quantite?: number;
    prixUnitaire?: number;
    prixTotal?: number;
    couleurSelectionnee?: string;
    tailleSelectionnee?: string;
    modeleSelectionne?: string;
  };
  showPrice?: boolean;
  compact?: boolean;
}

export default function ArticleCommande({ item, showPrice = true, compact = false }: ArticleCommandeProps) {
  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
    }
    return images[0];
  };

  const calculatePrice = () => {
    if (item.prixUnitaire) return item.prixUnitaire;
    const basePrice = item.produit?.prix || 0;
    const adjustment = item.variante?.prixAjustement || 0;
    return basePrice + adjustment;
  };

  const calculateTotal = () => {
    if (item.prixTotal) return item.prixTotal;
    return calculatePrice() * (item.quantite || 1);
  };

  const hasVariants = item.variante || item.couleurSelectionnee || item.tailleSelectionnee || item.modeleSelectionne;

  return (
    <div style={{ 
      display: 'flex', 
      gap: compact ? '12px' : '16px',
      padding: compact ? '12px' : '16px',
      backgroundColor: 'white',
      borderRadius: compact ? '8px' : '12px',
      border: '1px solid #e5e7eb'
    }}>
      <img
        src={getImageUrl(item.produit?.images)}
        alt={item.produit?.nom || 'Produit'}
        style={{ 
          width: compact ? '60px' : '80px', 
          height: compact ? '60px' : '80px', 
          objectFit: 'cover', 
          borderRadius: '8px',
          flexShrink: 0
        }}
      />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ 
          fontSize: compact ? '14px' : '16px', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.produit?.nom || 'Produit'}
        </h4>
        
        {hasVariants && (
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            marginBottom: '8px', 
            flexWrap: 'wrap' 
          }}>
            {(item.variante?.couleur || item.couleurSelectionnee) && (
              <Badge variant="couleur" size="sm">
                {item.variante?.couleur || item.couleurSelectionnee}
              </Badge>
            )}
            {(item.variante?.taille || item.tailleSelectionnee) && (
              <Badge variant="taille" size="sm">
                {item.variante?.taille || item.tailleSelectionnee}
              </Badge>
            )}
            {(item.variante?.modele || item.modeleSelectionne) && (
              <Badge variant="modele" size="sm">
                {item.variante?.modele || item.modeleSelectionne}
              </Badge>
            )}
            {item.variante?.capacite && (
              <Badge variant="capacite" size="sm">
                {item.variante.capacite}
              </Badge>
            )}
            {item.variante?.puissance && (
              <Badge variant="puissance" size="sm">
                {item.variante.puissance}
              </Badge>
            )}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: compact ? '12px' : '14px',
          color: '#6b7280'
        }}>
          <span>Quantité: {item.quantite || 1}</span>
          {showPrice && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              gap: '2px'
            }}>
              <span style={{ 
                fontSize: compact ? '14px' : '16px', 
                fontWeight: '600', 
                color: '#2563eb' 
              }}>
                {calculateTotal().toLocaleString()} FCFA
              </span>
              {!compact && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {calculatePrice().toLocaleString()} FCFA/unité
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}