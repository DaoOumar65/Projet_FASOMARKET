import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ShoppingBag } from 'lucide-react';
import { formatDateOnly } from '../utils/dateUtils';

interface Order {
  id: string;
  montantTotal: number;
  status: string;
  dateCreation: string;
  adresseLivraison: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('order');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/client/commandes/${orderId}`, {
        headers: { 
          'X-User-Id': localStorage.getItem('userId') || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    window.open(`http://localhost:8081/api/factures/${orderId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        padding: '48px', 
        maxWidth: '500px', 
        width: '100%', 
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
      }}>
        <div style={{ marginBottom: '32px' }}>
          <CheckCircle size={64} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Paiement réussi !
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Votre commande a été payée avec succès (Mode Test)
          </p>
        </div>
        
        {order && (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Détails de la commande
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Numéro :</span>
                <span style={{ fontWeight: '500' }}>#{order.id.substring(0, 8)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Montant :</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>{order.montantTotal.toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Statut :</span>
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#dcfce7', 
                  color: '#16a34a', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: '500' 
                }}>
                  Payée
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Date :</span>
                <span>{formatDateOnly(order.dateCreation)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={downloadInvoice}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Télécharger la facture
          </button>
          
          <Link 
            to="/client/commandes"
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShoppingBag size={16} />
            Voir mes commandes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;