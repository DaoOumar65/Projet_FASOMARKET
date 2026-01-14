import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecupererCommandesAPI: React.FC = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const recupererCommandes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      console.log('User ID:', userId);
      console.log('User Role:', userRole);
      
      let endpoint = '';
      if (userRole === 'CLIENT') {
        endpoint = 'http://localhost:8081/api/client/commandes';
      } else if (userRole === 'VENDOR') {
        endpoint = 'http://localhost:8081/api/vendeur/commandes';
      } else {
        setError('Rôle utilisateur non reconnu');
        return;
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        }
      });
      
      console.log('Réponse API:', response.data);
      setCommandes(response.data);
      
    } catch (error: any) {
      console.error('Erreur API:', error);
      setError(`Erreur: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recupererCommandes();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Récupération Commandes API
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={recupererCommandes}
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
          {loading ? 'Chargement...' : 'Recharger'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>
          Commandes trouvées: {commandes.length}
        </h2>
        
        <pre style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '12px',
          border: '1px solid #e2e8f0',
          maxHeight: '500px'
        }}>
          {JSON.stringify(commandes, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Informations de connexion:</h3>
        <ul style={{ color: '#6b7280', fontSize: '14px' }}>
          <li>User ID: {localStorage.getItem('userId') || 'Non défini'}</li>
          <li>User Role: {localStorage.getItem('userRole') || 'Non défini'}</li>
          <li>Token présent: {localStorage.getItem('token') ? 'Oui' : 'Non'}</li>
        </ul>
      </div>
    </div>
  );
};

export default RecupererCommandesAPI;