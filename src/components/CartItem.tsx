import { Trash2 } from 'lucide-react';

interface CartItemProps {
  item: {
    id: string;
    nomProduit: string;
    nomBoutique: string;
    couleurSelectionnee?: string;
    tailleSelectionnee?: string;
    modeleSelectionne?: string;
    prixUnitaire: number;
    quantite: number;
    prixTotal: number;
  };
  onUpdate?: () => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            {item.nomProduit}
          </h4>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            {item.nomBoutique}
          </p>
          
          {/* Options sélectionnées */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {item.couleurSelectionnee && (
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                🎨 {item.couleurSelectionnee}
              </span>
            )}
            {item.tailleSelectionnee && (
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                📏 {item.tailleSelectionnee}
              </span>
            )}
            {item.modeleSelectionne && (
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                🏷️ {item.modeleSelectionne}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Prix </span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.prixUnitaire.toLocaleString()} FCFA</span>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Quantité </span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.quantite}</span>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Total </span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>{item.prixTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onRemove(item.id)}
          style={{
            padding: '8px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginLeft: '16px'
          }}
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;