import { useState } from 'react';
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  nom: string;
  quantiteStock: number;
}

interface StockAlertProps {
  product: Product;
  onRestock: () => void;
}

const StockAlert: React.FC<StockAlertProps> = ({ product, onRestock }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestock = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error('Veuillez saisir une quantité valide');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/vendeur/produits/${product.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId') || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          quantiteStock: parseInt(quantity),
          seuilAlerte: 5
        })
      });

      if (response.ok) {
        onRestock();
        setQuantity('');
        toast.success('Stock mis à jour avec succès');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du stock');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (product.quantiteStock === 0) {
      return { 
        color: '#dc2626', 
        bgColor: '#fee2e2', 
        text: 'Rupture de stock', 
        icon: <XCircle size={16} /> 
      };
    }
    if (product.quantiteStock <= 5) {
      return { 
        color: '#d97706', 
        bgColor: '#fef3c7', 
        text: 'Stock faible', 
        icon: <AlertTriangle size={16} /> 
      };
    }
    return { 
      color: '#16a34a', 
      bgColor: '#dcfce7', 
      text: 'En stock', 
      icon: <CheckCircle size={16} /> 
    };
  };

  const status = getStockStatus();

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${status.color}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            {product.nom}
          </h4>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '4px 8px',
            backgroundColor: status.bgColor,
            borderRadius: '6px',
            width: 'fit-content'
          }}>
            <span style={{ color: status.color }}>{status.icon}</span>
            <span style={{ color: status.color, fontWeight: '500', fontSize: '14px' }}>
              {status.text} - {product.quantiteStock} unités
            </span>
          </div>
        </div>
        
        {product.quantiteStock <= 5 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Quantité"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              style={{
                width: '100px',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleRestock}
              disabled={loading}
              style={{ 
                padding: '8px 16px',
                backgroundColor: loading ? '#9ca3af' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Package size={16} />
              {loading ? 'Mise à jour...' : 'Réapprovisionner'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlert;