import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VendeurCommandesTest: React.FC = () => {
  console.log('TEST: Composant chargé');
  
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const chargerCommandes = async () => {
      try {
        const userId = '615c948e-cb64-4eae-9c35-c45283a1ce16';
        const token = localStorage.getItem('token');
        
        console.log('Appel API avec userId:', userId);
        
        const response = await axios.get('http://localhost:8081/api/vendeur/commandes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId
          }
        });
        
        console.log('Réponse API:', response.data);
        setCommandes(response.data);
        
      } catch (error: any) {
        console.error('Erreur API:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    chargerCommandes();
  }, []);
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Chargement...</div>;
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Commandes Vendeur</h1>
      <p>User ID: 615c948e-cb64-4eae-9c35-c45283a1ce16</p>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Erreur: {error}
        </div>
      )}
      
      <h2>Commandes trouvées: {commandes.length}</h2>
      
      <pre style={{
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderRadius: '5px',
        overflow: 'auto',
        fontSize: '12px'
      }}>
        {JSON.stringify(commandes, null, 2)}
      </pre>
    </div>
  );
};

export default VendeurCommandesTest;