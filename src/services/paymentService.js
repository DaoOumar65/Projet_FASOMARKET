const API_BASE_URL = 'http://localhost:8081/api';

export const paymentService = {
  async initierPaiement(paymentData) {
    console.log('Données envoyées:', paymentData);
    const response = await fetch(`${API_BASE_URL}/paiements/initier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId')
      },
      body: JSON.stringify(paymentData)
    });
    
    const responseData = await response.json();
    console.log('Réponse backend:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `Erreur ${response.status}: ${responseData}`);
    }
    return responseData;
  },

  async verifierPaiementCommande(commandeId) {
    const response = await fetch(`${API_BASE_URL}/paiements/commande/${commandeId}`, {
      headers: { 'X-User-Id': localStorage.getItem('userId') }
    });
    if (!response.ok) throw new Error('Aucun paiement trouvé');
    return response.json();
  },

  async verifierStatut(transactionId) {
    const response = await fetch(`${API_BASE_URL}/paiements/statut/${transactionId}`, {
      headers: { 'X-User-Id': localStorage.getItem('userId') }
    });
    return response.json();
  }
};

export const processerPaiementCommande = async (commande, modePaiement, numeroTelephone) => {
  try {
    // Vérifier d'abord s'il existe déjà un paiement pour cette commande
    const existingPayment = await paymentService.verifierPaiementCommande(commande.id);
    if (existingPayment && existingPayment.status === 'PENDING') {
      // Rediriger vers le paiement existant
      if (existingPayment.paymentUrl) {
        window.location.href = existingPayment.paymentUrl;
        return existingPayment;
      }
    }
  } catch (error) {
    // Ignorer l'erreur si aucun paiement existant
  }

  const paymentData = {
    commandeId: commande.id,
    montant: commande.totalAmount || commande.total,
    modePaiement: modePaiement,
    numeroTelephone: numeroTelephone,
    email: localStorage.getItem('userEmail') || 'client@fasomarket.com',
    nomClient: localStorage.getItem('userName') || 'Client FasoMarket',
    description: `Commande FasoMarket #${commande.numeroCommande || commande.id}`
  };

  const result = await paymentService.initierPaiement(paymentData);
  
  if (result.success) {
    window.location.href = result.paymentUrl;
    return result;
  } else {
    throw new Error(result.message || 'Erreur lors du paiement');
  }
};