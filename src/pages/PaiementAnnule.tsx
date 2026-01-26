import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

const PaiementAnnule: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: 'white', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ marginBottom: '32px' }}>
          <XCircle size={64} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Paiement Annulé
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
          <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
            Si vous rencontrez des difficultés, contactez notre support client.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={20} />
            Réessayer le paiement
          </button>
          
          <Link
            to="/client/commandes"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              color: '#374151',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={16} />
            Retour aux commandes
          </Link>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
            💡 Astuce : Vérifiez votre solde avant de réessayer
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaiementAnnule;