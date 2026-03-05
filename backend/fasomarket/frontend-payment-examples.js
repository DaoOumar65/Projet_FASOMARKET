// ============================================
// EXEMPLES D'INTÉGRATION FRONTEND - PAIEMENTS
// ============================================

// ==========================================
// 1. SERVICE DE PAIEMENT (React/Vue/Angular)
// ==========================================

class PaymentService {
  constructor() {
    this.baseURL = 'http://localhost:8081/api';
  }

  /**
   * Initier un paiement pour une commande
   */
  async initierPaiement(commandeId, montant, modePaiement = 'ORANGE_MONEY') {
    const userId = localStorage.getItem('userId');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    try {
      const response = await fetch(`${this.baseURL}/client/paiements/payer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          commandeId: commandeId,
          montant: montant,
          modePaiement: modePaiement,
          numeroTelephone: userInfo.phone || '+22670000000',
          email: userInfo.email || 'client@example.com',
          nomClient: userInfo.fullName || 'Client'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers la page de paiement
        window.location.href = data.paymentUrl;
        return data;
      } else {
        throw new Error(data.message || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      throw error;
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async verifierStatut(transactionId) {
    try {
      const response = await fetch(`${this.baseURL}/paiements/statut/${transactionId}`);
      return await response.json();
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des paiements
   */
  async obtenirHistorique() {
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(`${this.baseURL}/client/paiements/historique`, {
        headers: {
          'X-User-Id': userId
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur historique:', error);
      throw error;
    }
  }

  /**
   * MODE TEST UNIQUEMENT - Simuler un paiement réussi
   */
  async simulerSucces(transactionId) {
    try {
      const response = await fetch(`${this.baseURL}/paiements/simuler-succes/${transactionId}`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur simulation:', error);
      throw error;
    }
  }
}

// ==========================================
// 2. COMPOSANT REACT - PAGE DE PAIEMENT
// ==========================================

import React, { useState } from 'react';

function PaymentPage({ commande }) {
  const [loading, setLoading] = useState(false);
  const [modePaiement, setModePaiement] = useState('ORANGE_MONEY');
  const paymentService = new PaymentService();

  const handlePaiement = async () => {
    setLoading(true);
    try {
      await paymentService.initierPaiement(
        commande.id,
        commande.totalAmount,
        modePaiement
      );
      // L'utilisateur sera redirigé automatiquement
    } catch (error) {
      alert('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <h2>Paiement de la commande #{commande.id.substring(0, 8)}</h2>
      
      <div className="order-summary">
        <p>Montant total: {commande.totalAmount} XOF</p>
      </div>

      <div className="payment-methods">
        <h3>Choisissez votre mode de paiement</h3>
        
        <label>
          <input
            type="radio"
            value="ORANGE_MONEY"
            checked={modePaiement === 'ORANGE_MONEY'}
            onChange={(e) => setModePaiement(e.target.value)}
          />
          Orange Money
        </label>

        <label>
          <input
            type="radio"
            value="MOOV_MONEY"
            checked={modePaiement === 'MOOV_MONEY'}
            onChange={(e) => setModePaiement(e.target.value)}
          />
          Moov Money
        </label>

        <label>
          <input
            type="radio"
            value="CORIS_MONEY"
            checked={modePaiement === 'CORIS_MONEY'}
            onChange={(e) => setModePaiement(e.target.value)}
          />
          Coris Money
        </label>
      </div>

      <button 
        onClick={handlePaiement} 
        disabled={loading}
        className="btn-pay"
      >
        {loading ? 'Redirection...' : 'Payer maintenant'}
      </button>
    </div>
  );
}

// ==========================================
// 3. PAGE DE SUCCÈS (après paiement)
// ==========================================

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const paymentService = new PaymentService();

  useEffect(() => {
    const token = searchParams.get('token');
    const orderId = searchParams.get('orderId');

    if (token) {
      verifierPaiement(token);
    }
  }, []);

  const verifierPaiement = async (transactionId) => {
    try {
      const data = await paymentService.verifierStatut(transactionId);
      setPaymentInfo(data);
      
      if (data.status === 'COMPLETED') {
        setStatus('success');
      } else if (data.status === 'PENDING') {
        setStatus('pending');
        // Revérifier après 3 secondes
        setTimeout(() => verifierPaiement(transactionId), 3000);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <div>Vérification du paiement...</div>;
  }

  if (status === 'success') {
    return (
      <div className="payment-success">
        <h1>✅ Paiement réussi !</h1>
        <p>Votre commande a été payée avec succès.</p>
        <p>Montant: {paymentInfo.montant} XOF</p>
        <p>Transaction: {paymentInfo.transactionId}</p>
        <button onClick={() => window.location.href = '/mes-commandes'}>
          Voir mes commandes
        </button>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="payment-pending">
        <h1>⏳ Paiement en cours...</h1>
        <p>Veuillez patienter pendant la vérification.</p>
      </div>
    );
  }

  return (
    <div className="payment-failed">
      <h1>❌ Paiement échoué</h1>
      <p>Une erreur est survenue lors du paiement.</p>
      <button onClick={() => window.location.href = '/panier'}>
        Réessayer
      </button>
    </div>
  );
}

// ==========================================
// 4. PAGE DE TEST (MODE TEST UNIQUEMENT)
// ==========================================

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentTestPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');
  const orderId = searchParams.get('orderId');
  const paymentService = new PaymentService();

  const simulerSucces = async () => {
    setLoading(true);
    try {
      await paymentService.simulerSucces(token);
      alert('Paiement simulé avec succès !');
      window.location.href = `/paiement/succes?token=${token}&orderId=${orderId}`;
    } catch (error) {
      alert('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  const simulerEchec = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/paiements/simuler-echec/${token}`, {
        method: 'POST'
      });
      alert('Échec simulé');
      window.location.href = `/paiement/annule?token=${token}`;
    } catch (error) {
      alert('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-test">
      <h1>🧪 Mode Test - Simulation de Paiement</h1>
      
      <div className="test-info">
        <p><strong>Transaction:</strong> {token}</p>
        <p><strong>Commande:</strong> {orderId}</p>
      </div>

      <div className="test-actions">
        <button 
          onClick={simulerSucces} 
          disabled={loading}
          className="btn-success"
        >
          ✅ Simuler Succès
        </button>

        <button 
          onClick={simulerEchec} 
          disabled={loading}
          className="btn-danger"
        >
          ❌ Simuler Échec
        </button>
      </div>

      <div className="test-warning">
        ⚠️ Cette page n'est disponible qu'en mode TEST
      </div>
    </div>
  );
}

// ==========================================
// 5. COMPOSANT HISTORIQUE PAIEMENTS
// ==========================================

import React, { useEffect, useState } from 'react';

function PaymentHistory() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const paymentService = new PaymentService();

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      const data = await paymentService.obtenirHistorique();
      setPaiements(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'COMPLETED': { text: 'Réussi', class: 'badge-success' },
      'PENDING': { text: 'En attente', class: 'badge-warning' },
      'FAILED': { text: 'Échoué', class: 'badge-danger' }
    };
    return badges[status] || { text: status, class: 'badge-default' };
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="payment-history">
      <h2>Historique des paiements</h2>
      
      {paiements.length === 0 ? (
        <p>Aucun paiement pour le moment</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map(paiement => {
              const badge = getStatusBadge(paiement.status);
              return (
                <tr key={paiement.id}>
                  <td>{new Date(paiement.dateCreation).toLocaleDateString()}</td>
                  <td>{paiement.transactionId}</td>
                  <td>{paiement.montant} XOF</td>
                  <td>{paiement.modePaiement}</td>
                  <td>
                    <span className={`badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ==========================================
// 6. CONFIGURATION DES ROUTES (React Router)
// ==========================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... autres routes ... */}
        
        <Route path="/paiement/:commandeId" element={<PaymentPage />} />
        <Route path="/paiement/test" element={<PaymentTestPage />} />
        <Route path="/paiement/succes" element={<PaymentSuccessPage />} />
        <Route path="/paiement/annule" element={<PaymentCancelPage />} />
        <Route path="/mes-paiements" element={<PaymentHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

// ==========================================
// 7. STYLES CSS SUGGÉRÉS
// ==========================================

/*
.payment-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.payment-methods label {
  display: block;
  padding: 15px;
  margin: 10px 0;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.payment-methods label:hover {
  border-color: #ff6b35;
}

.btn-pay {
  width: 100%;
  padding: 15px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}

.btn-pay:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.badge-success { background: #28a745; color: white; }
.badge-warning { background: #ffc107; color: black; }
.badge-danger { background: #dc3545; color: white; }
*/

export { PaymentService, PaymentPage, PaymentSuccessPage, PaymentTestPage, PaymentHistory };
