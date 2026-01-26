import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, CreditCard, Smartphone, Truck, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ModePaiement {
  id: string;
  nom: string;
  logo: string;
  description: string;
  frais: number;
  actif: boolean;
}

interface PaiementResult {
  statut: 'SUCCES' | 'ECHEC';
  message: string;
  transactionId?: string;
  modePaiement?: string;
  numeroTelephone?: string;
  montant?: number;
  dateTransaction?: string;
  codeErreur?: string;
}

export default function PaiementSimule() {
  const navigate = useNavigate();
  const { commandeId } = useParams();
  const [modes, setModes] = useState<ModePaiement[]>([]);
  const [selectedMode, setSelectedMode] = useState('');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [montant, setMontant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaiementResult | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [step, setStep] = useState<'selection' | 'form' | 'processing' | 'result'>('selection');

  useEffect(() => {
    fetchModesPaiement();
    fetchCommandeDetails();
  }, []);

  const fetchModesPaiement = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/client/paiement/modes', {
        headers: { 'X-User-Id': localStorage.getItem('userId') || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setModes(data);
      } else {
        // Modes par défaut si l'API n'est pas disponible
        setModes([
          {
            id: 'ORANGE_MONEY',
            nom: 'Orange Money',
            logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
            description: 'Paiement via Orange Money',
            frais: 0,
            actif: true
          },
          {
            id: 'MOOV_MONEY',
            nom: 'Moov Money',
            logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
            description: 'Paiement via Moov Money',
            frais: 0,
            actif: true
          },
          {
            id: 'CORIS_MONEY',
            nom: 'Coris Money',
            logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
            description: 'Paiement via Coris Money',
            frais: 0,
            actif: true
          },
          {
            id: 'CASH_ON_DELIVERY',
            nom: 'Paiement à la livraison',
            logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop',
            description: 'Payer en espèces à la réception',
            frais: 0,
            actif: true
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement modes paiement:', error);
    }
  };

  const fetchCommandeDetails = async () => {
    // Simuler le montant de la commande
    setMontant(25000);
  };

  const validatePaiement = () => {
    if (!selectedMode) return "Sélectionnez un mode de paiement";
    if (selectedMode !== 'CASH_ON_DELIVERY') {
      if (!numeroTelephone) return "Numéro de téléphone requis";
      if (!numeroTelephone.match(/^\+226\d{8}$/)) {
        return "Format requis: +226XXXXXXXX";
      }
    }
    return null;
  };

  const simulerPaiement = async () => {
    const error = validatePaiement();
    if (error) {
      toast.error(error);
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paiementData = {
        commandeId,
        modePaiement: selectedMode,
        numeroTelephone: selectedMode === 'CASH_ON_DELIVERY' ? '' : numeroTelephone,
        montant
      };

      const response = await fetch('http://localhost:8081/api/client/paiement/simuler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId') || ''
        },
        body: JSON.stringify(paiementData)
      });

      let result: PaiementResult;
      
      if (response.ok) {
        result = await response.json();
      } else {
        // Simulation locale si l'API n'est pas disponible
        const success = Math.random() > 0.1; // 90% de succès
        if (success) {
          result = {
            statut: 'SUCCES',
            message: 'Paiement effectué avec succès',
            transactionId: `TXN-${Date.now()}`,
            modePaiement: selectedMode,
            numeroTelephone,
            montant,
            dateTransaction: new Date().toISOString()
          };
        } else {
          result = {
            statut: 'ECHEC',
            message: 'Paiement échoué. Veuillez réessayer.',
            codeErreur: 'ERR_456'
          };
        }
      }

      if (result.statut === 'SUCCES') {
        setPaymentSuccess(result);
        toast.success('Paiement réussi !');
      } else {
        setPaymentError(result.message);
        toast.error(result.message);
      }
      setStep('result');
    } catch (error) {
      setPaymentError('Erreur de connexion');
      toast.error('Erreur de connexion');
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (modeId: string) => {
    switch (modeId) {
      case 'CASH_ON_DELIVERY': return <Truck size={24} />;
      default: return <Smartphone size={24} />;
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Paiement</h1>
      </div>

      {/* Sélection du mode de paiement */}
      {step === 'selection' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Choisissez votre mode de paiement
          </h2>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
            {modes.filter(mode => mode.actif).map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  padding: '16px',
                  border: selectedMode === mode.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: selectedMode === mode.id ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  {getIcon(mode.id)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {mode.nom}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{mode.description}</p>
                  {mode.frais > 0 && (
                    <span style={{ fontSize: '12px', color: '#ef4444' }}>Frais: {mode.frais} FCFA</span>
                  )}
                </div>
                {selectedMode === mode.id && (
                  <CheckCircle size={20} color="#2563eb" />
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setStep('form')}
            disabled={!selectedMode}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: selectedMode ? '#2563eb' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: selectedMode ? 'pointer' : 'not-allowed'
            }}
          >
            Continuer
          </button>
        </div>
      )}

      {/* Formulaire de paiement */}
      {step === 'form' && (
        <div>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Mode sélectionné: {modes.find(m => m.id === selectedMode)?.nom}
            </h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
              Total à payer: {montant.toLocaleString()} FCFA
            </p>
          </div>

          {selectedMode !== 'CASH_ON_DELIVERY' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Numéro de téléphone
              </label>
              <input
                type="tel"
                placeholder="+226XXXXXXXX"
                value={numeroTelephone}
                onChange={(e) => setNumeroTelephone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Format: +226XXXXXXXX (numéro burkinabé)
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setStep('selection')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Retour
            </button>
            <button
              onClick={simulerPaiement}
              style={{
                flex: 2,
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Payer maintenant
            </button>
          </div>
        </div>
      )}

      {/* État de traitement */}
      {step === 'processing' && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }}></div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Traitement du paiement en cours...
          </h2>
          <p style={{ color: '#6b7280' }}>Veuillez patienter</p>
        </div>
      )}

      {/* Résultat */}
      {step === 'result' && (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          {paymentSuccess ? (
            <>
              <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '16px' }}>
                Paiement réussi !
              </h2>
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <strong>Transaction ID:</strong> {paymentSuccess.transactionId}
                </p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  <strong>Mode:</strong> {modes.find(m => m.id === paymentSuccess.modePaiement)?.nom}
                </p>
                <p style={{ fontSize: '14px', color: '#374151' }}>
                  <strong>Montant:</strong> {paymentSuccess.montant?.toLocaleString()} FCFA
                </p>
              </div>
              <button
                onClick={() => navigate('/client/commandes')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Voir mes commandes
              </button>
            </>
          ) : (
            <>
              <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginBottom: '16px' }}>
                Paiement échoué
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>{paymentError}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setStep('form')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Réessayer
                </button>
                <button
                  onClick={() => navigate(-1)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}