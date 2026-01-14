import React, { useState, useEffect } from 'react';

const RecupererCommandes: React.FC = () => {
  const [commandes, setCommandes] = useState<any[]>([]);

  useEffect(() => {
    const commandesStockees = localStorage.getItem('commandes');
    if (commandesStockees) {
      try {
        const parsed = JSON.parse(commandesStockees);
        setCommandes(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (error) {
        console.error('Erreur parsing commandes:', error);
        setCommandes([]);
      }
    }
  }, []);

  const ajouterCommandeTest = () => {
    const nouvelleCommande = {
      id: `cmd-${Date.now()}`,
      statut: 'en_attente',
      dateCommande: new Date().toISOString(),
      adresseLivraison: 'Test Adresse, Ouagadougou',
      telephone: '+226 70 00 00 00',
      total: 15000,
      produits: [
        {
          id: 'prod-1',
          nom: 'Produit Test',
          prix: 5000,
          quantite: 3,
          vendeurId: localStorage.getItem('userId') || '1',
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
        }
      ]
    };

    const commandesExistantes = JSON.parse(localStorage.getItem('commandes') || '[]');
    commandesExistantes.push(nouvelleCommande);
    localStorage.setItem('commandes', JSON.stringify(commandesExistantes));
    setCommandes(commandesExistantes);
  };

  const viderCommandes = () => {
    localStorage.removeItem('commandes');
    setCommandes([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Récupération des Commandes
      </h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={ajouterCommandeTest}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Ajouter Commande Test
        </button>
        
        <button
          onClick={viderCommandes}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Vider Commandes
        </button>
      </div>

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
          border: '1px solid #e2e8f0'
        }}>
          {JSON.stringify(commandes, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Informations:</h3>
        <ul style={{ color: '#6b7280', fontSize: '14px' }}>
          <li>User ID actuel: {localStorage.getItem('userId') || 'Non défini'}</li>
          <li>Nombre total de commandes: {commandes.length}</li>
          <li>Commandes pour ce vendeur: {commandes.filter(c => 
            c.produits?.some((p: any) => p.vendeurId === localStorage.getItem('userId'))
          ).length}</li>
        </ul>
      </div>
    </div>
  );
};

export default RecupererCommandes;