import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/api';
import { usePanier } from '../hooks/usePanier';

const Commande: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { synchroniserAvecBackend, panierItems } = usePanier();

  // Pas de gestion d'adresses pour l'instant

  const creerCommande = async () => {
    if (panierItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setLoading(true);
    try {
      // Synchroniser le panier local avec le backend
      const syncSuccess = await synchroniserAvecBackend();
      if (!syncSuccess) {
        toast.error('Erreur de synchronisation du panier');
        return;
      }

      const response = await clientService.creerCommande({
        adresseLivraison: 'Adresse de livraison par défaut, Ouagadougou',
        numeroTelephone: '+22670000000',
        needsDelivery: true
      });

      const commandeData = response.data;
      console.log('Commande créée:', commandeData);
      toast.success(commandeData.message || 'Commande créée avec succès');
      navigate(`/paiement/${commandeData.id}`);
    } catch (error: any) {
      console.error('Erreur création commande:', error);
      console.error('Détails erreur:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Erreur lors de la création de la commande';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '32px' }}>
          Finaliser la commande
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Résumé du panier */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Résumé de votre commande</h2>
            {panierItems.length > 0 ? (
              <div>
                {panierItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{item.produit.nom}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Quantité: {item.quantite}</p>
                    </div>
                    <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{(item.produit.prix * item.quantite).toLocaleString()} FCFA</p>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', marginTop: '16px', borderTop: '2px solid #e5e7eb' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Total</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb', margin: 0 }}>
                    {panierItems.reduce((sum, item) => sum + (item.produit.prix * item.quantite), 0).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>Votre panier est vide</p>
            )}
          </div>

          {/* Information */}
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '16px' }}>
            <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
              <strong>Information :</strong> Une adresse de livraison par défaut sera utilisée pour cette commande.
            </p>
          </div>

          {/* Bouton de confirmation */}
          <button
            onClick={creerCommande}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <CreditCard size={20} />
            {loading ? 'Création...' : 'Procéder au paiement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Commande;