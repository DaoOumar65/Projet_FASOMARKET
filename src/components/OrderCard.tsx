import PaymentButton from './PaymentButton';
import { Download, Package } from 'lucide-react';
import { formatDateOnly } from '../utils/dateUtils';

interface Order {
  id: string;
  montantTotal: number;
  status: string;
  dateCreation: string;
  adresseLivraison: string;
}

interface OrderCardProps {
  order: Order;
  onUpdate?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdate }) => {
  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': 
        return { bg: '#fef3c7', text: '#d97706', label: 'En attente' };
      case 'PAID': 
        return { bg: '#dcfce7', text: '#16a34a', label: 'Payée' };
      case 'DELIVERED': 
        return { bg: '#dbeafe', text: '#2563eb', label: 'Livrée' };
      case 'CANCELLED':
        return { bg: '#fee2e2', text: '#dc2626', label: 'Annulée' };
      default: 
        return { bg: '#f3f4f6', text: '#6b7280', label: status };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  const downloadInvoice = () => {
    window.open(`http://localhost:8081/api/factures/${order.id}/pdf`, '_blank');
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            Commande #{order.id.substring(0, 8)}
          </h4>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            {formatDateOnly(order.dateCreation)}
          </p>
        </div>
        <span style={{
          padding: '6px 12px',
          backgroundColor: statusConfig.bg,
          color: statusConfig.text,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {statusConfig.label}
        </span>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>💰</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {order.montantTotal.toLocaleString()} FCFA
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>📍</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {order.adresseLivraison}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {order.status === 'PENDING' && (
          <PaymentButton 
            order={order} 
            onPaymentSuccess={onUpdate}
          />
        )}
        
        {(order.status === 'PAID' || order.status === 'DELIVERED') && (
          <button 
            onClick={downloadInvoice}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              color: '#2563eb',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={16} />
            Télécharger facture
          </button>
        )}

        {order.status === 'PAID' && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#dcfce7',
            borderRadius: '6px'
          }}>
            <Package size={16} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>
              En cours de préparation
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;