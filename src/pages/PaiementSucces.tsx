import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { paymentService } from '../services/paymentService';

const PaiementSucces: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [statut, setStatut] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      paymentService.verifierStatut(token)
        .then(setStatut)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: 'white', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '24px' }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Paiement Réussi !
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Votre paiement a été traité avec succès.
          </p>
        </div>

        {statut && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#374151' }}>Transaction :</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{statut.transactionId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#374151' }}>Montant :</span>
              <span style={{ fontWeight: '600', color: '#10b981', fontSize: '18px' }}>
                {statut.montant?.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            to="/client/commandes"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <Package size={20} />
            Voir mes commandes
            <ArrowRight size={16} />
          </Link>
          
          <Link
            to="/"
            style={{
              padding: '12px',
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Retour à l'accueil
          </Link>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#2563eb', margin: 0 }}>
            📧 Un email de confirmation vous sera envoyé sous peu
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaiementSucces;