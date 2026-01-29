import { useState } from 'react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

export default function TestVariantes() {
  const [produitId, setProduitId] = useState('');
  const [variantes, setVariantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const testerEndpoint = async () => {
    if (!produitId.trim()) {
      toast.error('Veuillez saisir un ID de produit');
      return;
    }

    setLoading(true);
    setErrorDetails(null);
    try {
      console.log('Test endpoint:', `/api/vendeur/produits/${produitId}/variantes`);
      console.log('Headers envoyés:', {
        'X-User-Id': localStorage.getItem('userId'),
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : 'Non défini'
      });
      
      const response = await vendorService.getProduitVariantes(produitId);
      console.log('Réponse complète:', response);
      console.log('Données variantes:', response.data);
      
      setVariantes(response.data || []);
      toast.success(`${response.data?.length || 0} variante(s) trouvée(s)`);
    } catch (error: any) {
      console.error('Erreur complète:', error);
      console.error('Réponse erreur:', error.response);
      console.error('Données erreur:', error.response?.data);
      console.error('Message erreur backend:', error.response?.data?.message);
      
      setErrorDetails({
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        url: error.config?.url
      });
      
      toast.error(`Erreur ${error.response?.status}: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', margin: '20px', backgroundColor: '#fef3c7' }}>
      <h3>🔧 Test Endpoint Variantes</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="ID du produit"
          value={produitId}
          onChange={(e) => setProduitId(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            flex: 1
          }}
        />
        <button
          onClick={testerEndpoint}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Test...' : 'Tester'}
        </button>
      </div>

      {errorDetails && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
          <h4 style={{ color: '#dc2626', marginBottom: '10px' }}>❌ Erreur détectée:</h4>
          <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            <div><strong>Status:</strong> {errorDetails.status}</div>
            <div><strong>URL:</strong> {errorDetails.url}</div>
            <div><strong>Message:</strong> {errorDetails.message}</div>
            {errorDetails.data && (
              <div>
                <strong>Détails:</strong>
                <pre style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '5px'
                }}>
                  {JSON.stringify(errorDetails.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {variantes.length > 0 && (
        <div>
          <h4 style={{ color: '#059669' }}>✅ Variantes trouvées ({variantes.length}):</h4>
          <pre style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '10px', 
            borderRadius: '6px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {JSON.stringify(variantes, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}