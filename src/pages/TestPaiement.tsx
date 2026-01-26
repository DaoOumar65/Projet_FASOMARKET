import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const TestPaiement: React.FC = () => {
  console.log('TestPaiement component loaded');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const testPaiement = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      // Étape 1: Créer une commande de test d'abord
      console.log('Création commande de test...');
      const commandeRes = await fetch(`http://localhost:8081/api/client/commandes/creer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440001',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        },
        body: JSON.stringify({
          adresseLivraison: 'Adresse de test, Ouagadougou',
          numeroTelephone: '+22670123456',
          needsDelivery: true
        })
      });
      
      if (!commandeRes.ok) {
        throw new Error('Impossible de créer une commande de test');
      }
      
      const commandeData = await commandeRes.json();
      console.log('Commande créée:', commandeData);
      
      // Étape 2: Tester le paiement avec l'ID de commande réel
      const testData = {
        commandeId: commandeData.id,
        userId: localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440001',
        montant: commandeData.total || 25000,
        modePaiement: 'ORANGE_MONEY',
        numeroTelephone: '+22670123456',
        email: 'test@example.com',
        nomClient: 'Client Test',
        description: `Commande FasoMarket #${commandeData.numeroCommande}`
      };
      
      const res = await fetch(`http://localhost:8081/api/paiements/initier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440001',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        },
        body: JSON.stringify(testData)
      });
      
      const data = await res.json();
      setResponse({
        endpoint: '/api/paiements/initier (PayDunya)',
        status: res.status,
        statusText: res.statusText,
        data: data,
        testData: testData,
        commandeCreee: commandeData
      });
      
      if (res.ok) {
        if (data.success && data.paymentUrl) {
          toast.success('Test complet réussi ! URL PayDunya générée.');
        } else {
          toast.warning('Endpoint répond mais pas d\'URL de paiement.');
        }
      } else {
        toast.error(`Erreur ${res.status}: ${data.message || res.statusText}`);
      }
    } catch (error: any) {
      setResponse({
        error: error.message,
        endpoint: '/api/paiements/initier'
      });
      toast.error('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '32px', 
        maxWidth: '600px', 
        width: '100%',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Test Endpoint Paiement
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={testPaiement}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <CreditCard size={20} />
            {loading ? 'Test en cours...' : 'Tester l\'endpoint PayDunya'}
          </button>
        </div>

        {response && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '12px' 
            }}>
              Réponse du serveur :
            </h3>
            <pre style={{
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              overflow: 'auto',
              margin: 0
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#92400e', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            <strong>Test :</strong> Crée une commande puis teste le paiement PayDunya.
            <br />
            <strong>Flux :</strong> 1) Création commande → 2) Test paiement avec ID réel
            <br />
            <strong>Attendu :</strong> Réponse avec success: true et paymentUrl PayDunya
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPaiement;