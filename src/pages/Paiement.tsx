import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { processerPaiementCommande } from '../services/paymentService';
import { clientService } from '../services/api';

const Paiement: React.FC = () => {
  const { commandeId } = useParams<{ commandeId: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<any>(null);
  const [modePaiement, setModePaiement] = useState('ORANGE_MONEY');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCommande, setLoadingCommande] = useState(true);

  useEffect(() => {
    if (commandeId) {
      fetchCommande();
    }
  }, [commandeId]);

  const fetchCommande = async () => {
    try {
      const response = await clientService.getCommande(commandeId!);
      setCommande(response.data);
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      toast.error('Commande introuvable');
      navigate('/client/commandes');
    } finally {
      setLoadingCommande(false);
    }
  };

  const handlePaiement = async () => {
    if (!numeroTelephone) {
      toast.error('Veuillez saisir votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      await processerPaiementCommande(commande, modePaiement, numeroTelephone);
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  if (loadingCommande) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!commande) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <CreditCard size={48} style={{ color: '#2563eb', margin: '0 auto 16px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Paiement Sécurisé
            </h1>
            <p style={{ color: '#6b7280' }}>
              Commande #{commande.numeroCommande || commande.id}
            </p>
          </div>

          <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', color: '#374151' }}>Montant à payer</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                {(commande.totalAmount || commande.total || 0).toLocaleString()} FCFA
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Choisissez votre mode de paiement
            </label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { 
                  value: 'ORANGE_MONEY', 
                  label: 'Orange Money', 
                  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNjYwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5PPC90ZXh0Pgo8L3N2Zz4K',
                  color: '#FF6600',
                  description: 'Paiement via Orange Money'
                },
                { 
                  value: 'MOOV_MONEY', 
                  label: 'Moov Money', 
                  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNjZDQyIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NPC90ZXh0Pgo8L3N2Zz4K',
                  color: '#0066CC',
                  description: 'Paiement via Moov Money'
                },
                { 
                  value: 'CORIS_MONEY', 
                  label: 'Coris Money', 
                  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0NDMDAwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K',
                  color: '#CC0000',
                  description: 'Paiement via Coris Money'
                }
              ].map((mode) => (
                <label
                  key={mode.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    border: `2px solid ${modePaiement === mode.value ? mode.color : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: modePaiement === mode.value ? `${mode.color}08` : 'white',
                    transition: 'all 0.2s ease',
                    boxShadow: modePaiement === mode.value ? `0 4px 12px ${mode.color}20` : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (modePaiement !== mode.value) {
                      e.currentTarget.style.borderColor = mode.color;
                      e.currentTarget.style.backgroundColor = `${mode.color}04`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (modePaiement !== mode.value) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <input
                    type="radio"
                    value={mode.value}
                    checked={modePaiement === mode.value}
                    onChange={(e) => setModePaiement(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <img 
                    src={mode.logo} 
                    alt={mode.label}
                    style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: modePaiement === mode.value ? mode.color : '#111827',
                      marginBottom: '4px'
                    }}>
                      {mode.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {mode.description}
                    </div>
                  </div>
                  {modePaiement === mode.value && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: mode.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'white'
                      }} />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Numéro de téléphone Mobile Money
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={numeroTelephone}
                onChange={(e) => setNumeroTelephone(e.target.value)}
                placeholder="+226 XX XX XX XX"
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 50px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <Smartphone 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#6b7280' 
                }} 
              />
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔒 Votre numéro sera utilisé uniquement pour ce paiement
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/client/commandes')}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Annuler
            </button>
            <button
              onClick={handlePaiement}
              disabled={loading || !numeroTelephone}
              style={{
                flex: 2,
                padding: '16px',
                backgroundColor: loading || !numeroTelephone ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading || !numeroTelephone ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: loading || !numeroTelephone ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading && numeroTelephone) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && numeroTelephone) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Payer {(commande.totalAmount || commande.total || 0).toLocaleString()} FCFA
                </>
              )}
            </button>
          </div>

          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Sécurisé par</div>
              <div style={{ 
                padding: '4px 12px', 
                backgroundColor: '#2563eb', 
                borderRadius: '6px', 
                color: 'white', 
                fontSize: '12px', 
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                PayDunya
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paiement;