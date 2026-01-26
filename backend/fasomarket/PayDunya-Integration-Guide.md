# Intégration Frontend PayDunya - FasoMarket

## Configuration Backend
1. Remplacez les clés dans application.properties:
```properties
payment.paydunya.master-key=VOTRE_MASTER_KEY_PAYDUNYA
payment.paydunya.private-key=VOTRE_PRIVATE_KEY_PAYDUNYA  
payment.paydunya.token=VOTRE_TOKEN_PAYDUNYA
```

## Service JavaScript Frontend

```javascript
// services/paymentService.js
const API_BASE_URL = 'http://localhost:8081/api';

export const paymentService = {
  async initierPaiement(paymentData) {
    const response = await fetch(`${API_BASE_URL}/paiements/initier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId')
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) throw new Error('Erreur paiement');
    return response.json();
  },

  async verifierStatut(transactionId) {
    const response = await fetch(`${API_BASE_URL}/paiements/statut/${transactionId}`, {
      headers: { 'X-User-Id': localStorage.getItem('userId') }
    });
    return response.json();
  }
};

// Fonction principale de paiement
export const processerPaiementCommande = async (commande, modePaiement, numeroTelephone) => {
  const paymentData = {
    commandeId: commande.id,
    userId: localStorage.getItem('userId'),
    montant: commande.totalAmount,
    modePaiement: modePaiement,
    numeroTelephone: numeroTelephone,
    email: localStorage.getItem('userEmail') || '',
    nomClient: localStorage.getItem('userName') || '',
    description: `Commande FasoMarket #${commande.numeroCommande}`
  };

  const result = await paymentService.initierPaiement(paymentData);
  
  if (result.success) {
    window.location.href = result.paymentUrl; // Redirection PayDunya
    return result;
  } else {
    throw new Error(result.message);
  }
};
```

## Composant React de Paiement

```jsx
// components/PaymentModal.jsx
import React, { useState } from 'react';
import { processerPaiementCommande } from '../services/paymentService';

const PaymentModal = ({ commande, onClose }) => {
  const [modePaiement, setModePaiement] = useState('ORANGE_MONEY');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePaiement = async () => {
    if (!numeroTelephone) {
      alert('Veuillez saisir votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      await processerPaiementCommande(commande, modePaiement, numeroTelephone);
    } catch (error) {
      alert('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal">
      <h3>Paiement Commande #{commande.numeroCommande}</h3>
      <p>Montant: {commande.totalAmount} FCFA</p>
      
      <div>
        <label>Mode de paiement:</label>
        <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}>
          <option value="ORANGE_MONEY">Orange Money</option>
          <option value="MOOV_MONEY">Moov Money</option>
          <option value="CORIS_MONEY">Coris Money</option>
        </select>
      </div>

      <div>
        <label>Numéro de téléphone:</label>
        <input 
          type="tel" 
          value={numeroTelephone}
          onChange={(e) => setNumeroTelephone(e.target.value)}
          placeholder="+226 XX XX XX XX"
        />
      </div>

      <div className="buttons">
        <button onClick={onClose}>Annuler</button>
        <button onClick={handlePaiement} disabled={loading}>
          {loading ? 'Traitement...' : 'Payer'}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
```

## Pages de Retour

```jsx
// pages/PaiementSucces.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

const PaiementSucces = () => {
  const [searchParams] = useSearchParams();
  const [statut, setStatut] = useState(null);
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      paymentService.verifierStatut(token)
        .then(setStatut)
        .catch(console.error);
    }
  }, [searchParams]);

  return (
    <div className="payment-success">
      <h2>✅ Paiement Réussi</h2>
      <p>Votre paiement a été traité avec succès.</p>
      {statut && (
        <div>
          <p>Transaction: {statut.transactionId}</p>
          <p>Montant: {statut.montant} FCFA</p>
        </div>
      )}
    </div>
  );
};

// pages/PaiementAnnule.jsx
const PaiementAnnule = () => (
  <div className="payment-cancelled">
    <h2>❌ Paiement Annulé</h2>
    <p>Votre paiement a été annulé.</p>
    <button onClick={() => window.history.back()}>Retour</button>
  </div>
);
```

## Endpoints Backend Disponibles

- `POST /api/paiements/initier` - Initier paiement PayDunya
- `POST /api/paiements/webhook` - Webhook PayDunya (automatique)
- `GET /api/paiements/statut/{id}` - Vérifier statut paiement
- `GET /api/paiements/mes-paiements` - Historique paiements

## Flux de Paiement

1. **Client clique "Payer"** → Appel `processerPaiementCommande()`
2. **Backend** → Crée invoice PayDunya avec vos clés
3. **PayDunya** → Retourne URL de paiement
4. **Redirection** → Client redirigé vers interface PayDunya
5. **Paiement** → Client effectue paiement (Orange Money, etc.)
6. **Webhook** → PayDunya notifie le backend automatiquement
7. **Retour** → Client redirigé vers page succès/échec

## Configuration Requise

1. **Remplacez les clés PayDunya** dans application.properties
2. **Configurez les URLs de retour** dans votre compte PayDunya:
   - Success: `http://localhost:5173/paiement/succes`
   - Cancel: `http://localhost:5173/paiement/annule`
   - Webhook: `http://localhost:8081/api/paiements/webhook`

L'intégration est maintenant complète et prête pour vos clés PayDunya réelles.