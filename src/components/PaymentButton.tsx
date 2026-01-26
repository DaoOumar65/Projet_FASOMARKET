import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  montantTotal: number;
  status: string;
}

interface PaymentButtonProps {
  order: Order;
  onPaymentSuccess?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ order, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8081/api/paiements/initier?commandeId=${order.id}`, {
        method: 'POST',
        headers: {
          'X-User-Id': localStorage.getItem('userId') || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error('Erreur lors de l\'initialisation du paiement');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={loading || order.status !== 'PENDING'}
      style={{
        padding: '12px 24px',
        backgroundColor: loading || order.status !== 'PENDING' ? '#9ca3af' : '#16a34a',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: loading || order.status !== 'PENDING' ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s'
      }}
    >
      <CreditCard size={16} />
      {loading ? 'Initialisation...' : `Payer ${order.montantTotal.toLocaleString()} FCFA (Mode Test)`}
    </button>
  );
};

export default PaymentButton;