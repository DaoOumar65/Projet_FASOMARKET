import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Phone, CheckCircle } from 'lucide-react';
import { usePanier } from '../hooks/usePanier';
import { useAuthStore } from '../store';
import { clientService } from '../services/api';
import AdresseMapSimple from '../components/AdresseMapSimple';
import axios from 'axios';

export default function PasserCommande() {
  const navigate = useNavigate();
  const { panierItems, total, viderPanier } = usePanier();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [commandeCreee, setCommandeCreee] = useState(false);
  const [numeroCommande, setNumeroCommande] = useState('');

  const [formData, setFormData] = useState({
    adresseLivraison: '',
    ville: '',
    telephone: user?.telephone || '',
    methodePaiement: 'MOBILE_MONEY',
    numeroMobileMoney: '',
    instructions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:8081/api/client/commandes/creer', {
        adresseLivraison: `${formData.adresseLivraison}, ${formData.ville}`,
        needsDelivery: true,
        numeroTelephone: formData.telephone
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        }
      });
      
      const orderId = response.data.id;
      const numeroCmd = response.data.numeroCommande || `CMD${Date.now()}`;
      setNumeroCommande(numeroCmd);
      setCommandeCreee(true);
      
      // Vider le panier
      await viderPanier();
      
    } catch (error: any) {
      console.error('Erreur lors de la création de commande:', error);
      alert('Erreur lors de la commande: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (panierItems.length === 0 && !commandeCreee) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 0' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '48px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Panier vide</h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Vous devez ajouter des produits à votre panier avant de passer commande.</p>
            <button
              onClick={() => navigate('/boutiques')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Découvrir les boutiques
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (commandeCreee) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 0' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '48px',
            textAlign: 'center'
          }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Commande confirmée !</h1>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>Votre commande #{numeroCommande} a été créée avec succès.</p>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>Vous recevrez un SMS de confirmation sous peu.</p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/client/commandes')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Voir mes commandes
              </button>
              <button
                onClick={() => navigate('/boutiques')}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 0' }}>
      <div style={{ maxWidth: '1536px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/panier')}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#2563eb',
              marginBottom: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            <ArrowLeft size={20} style={{ marginRight: '8px' }} />
            Retour au panier
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>Finaliser ma commande</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Formulaire de commande */}
          <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Adresse de livraison */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '24px'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <MapPin size={20} style={{ marginRight: '8px' }} />
                  Adresse de livraison
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      name="adresseLivraison"
                      value={formData.adresseLivraison}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                      placeholder="Ex: Secteur 15, Rue 123, Maison bleue"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                      placeholder="Ex: Ouagadougou"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                      placeholder="Ex: 70123456"
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Instructions de livraison (optionnel)
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                    placeholder="Ex: Sonner à la porte principale, demander Madame Kaboré"
                  />
                </div>
                
                {/* Aperçu de l'adresse avec Maps */}
                {formData.adresseLivraison && formData.ville && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '12px'
                    }}>
                      Aperçu de votre adresse de livraison :
                    </h3>
                    <AdresseMapSimple 
                      adresse={`${formData.adresseLivraison}, ${formData.ville}`}
                      nom="Adresse de livraison"
                    />
                  </div>
                )}
              </div>

              {/* Méthode de paiement */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '24px'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CreditCard size={20} style={{ marginRight: '8px' }} />
                  Méthode de paiement
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="methodePaiement"
                      value="MOBILE_MONEY"
                      checked={formData.methodePaiement === 'MOBILE_MONEY'}
                      onChange={handleInputChange}
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ color: '#374151' }}>Mobile Money (Orange Money, Moov Money)</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="methodePaiement"
                      value="PAIEMENT_LIVRAISON"
                      checked={formData.methodePaiement === 'PAIEMENT_LIVRAISON'}
                      onChange={handleInputChange}
                      style={{ marginRight: '12px' }}
                    />
                    <span style={{ color: '#374151' }}>Paiement à la livraison</span>
                  </label>
                </div>
                
                {formData.methodePaiement === 'MOBILE_MONEY' && (
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Numéro Mobile Money *
                    </label>
                    <input
                      type="tel"
                      name="numeroMobileMoney"
                      value={formData.numeroMobileMoney}
                      onChange={handleInputChange}
                      required={formData.methodePaiement === 'MOBILE_MONEY'}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                      placeholder="Ex: 70123456"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 24px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  color: 'white',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading ? 'Création en cours...' : 'Confirmer la commande'}
              </button>
            </form>
          </div>

          {/* Résumé de commande */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              position: 'sticky',
              top: '32px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Résumé de commande</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {panierItems.filter(item => item && item.produit).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {item.produit?.images?.[0] ? (
                        <img
                          src={item.produit.images[0]}
                          alt={item.produit.nom || 'Produit'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>IMG</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                        {item.produit?.nom || 'Produit inconnu'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Qté: {item.quantite} × {(item.produit?.prix || 0).toLocaleString()} FCFA
                      </p>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {((item.produit?.prix || 0) * item.quantite).toLocaleString()} FCFA
                    </p>
                  </div>
                ))}
              </div>
              
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Sous-total</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{(total || 0).toLocaleString()} FCFA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Frais de livraison</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>1 500 FCFA</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb' }}>
                    {((total || 0) + 1500).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
