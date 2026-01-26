import { CheckCircle, Clock, Package, Truck, CreditCard, ShoppingCart } from 'lucide-react';

interface Order {
  status: string;
}

interface OrderTimelineProps {
  order: Order;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const getStatusSteps = () => [
    { 
      key: 'PENDING', 
      label: 'Commande créée', 
      icon: <ShoppingCart size={20} />, 
      completed: true 
    },
    { 
      key: 'PAID', 
      label: 'Paiement confirmé', 
      icon: <CreditCard size={20} />, 
      completed: order.status !== 'PENDING' 
    },
    { 
      key: 'CONFIRMED', 
      label: 'Confirmée par vendeur', 
      icon: <CheckCircle size={20} />, 
      completed: ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) 
    },
    { 
      key: 'SHIPPED', 
      label: 'Expédiée', 
      icon: <Truck size={20} />, 
      completed: ['SHIPPED', 'DELIVERED'].includes(order.status) 
    },
    { 
      key: 'DELIVERED', 
      label: 'Livrée', 
      icon: <Package size={20} />, 
      completed: order.status === 'DELIVERED' 
    }
  ];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '24px', 
      border: '1px solid #e5e7eb' 
    }}>
      <h4 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '20px' 
      }}>
        Suivi de commande
      </h4>
      
      <div style={{ position: 'relative' }}>
        {getStatusSteps().map((step, index) => (
          <div key={step.key} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: index < getStatusSteps().length - 1 ? '24px' : '0',
            position: 'relative'
          }}>
            {/* Icône */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: step.completed ? '#16a34a' : '#f3f4f6',
              color: step.completed ? 'white' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              zIndex: 2,
              position: 'relative'
            }}>
              {step.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
            </div>

            {/* Contenu */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '500',
                color: step.completed ? '#111827' : '#6b7280',
                marginBottom: '4px'
              }}>
                {step.label}
              </div>
              {step.completed && (
                <div style={{
                  fontSize: '12px',
                  color: '#16a34a',
                  fontWeight: '500'
                }}>
                  Terminé
                </div>
              )}
            </div>

            {/* Connecteur */}
            {index < getStatusSteps().length - 1 && (
              <div style={{
                position: 'absolute',
                left: '19px',
                top: '40px',
                width: '2px',
                height: '24px',
                backgroundColor: step.completed ? '#16a34a' : '#e5e7eb'
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTimeline;