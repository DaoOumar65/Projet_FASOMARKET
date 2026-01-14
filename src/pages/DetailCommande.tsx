import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, MapPin, CreditCard } from 'lucide-react';
import { api } from '../services/api';

interface CommandeDetail {
  id: string | number;
  numeroCommande: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'PREPAREE' | 'EXPEDIEE' | 'LIVREE' | 'ANNULEE';
  total: number;
  dateCreation: string;
  adresseLivraison: string;
  methodePaiement: string;
  instructions?: string;
  items?: Array<{
    id: number;
    produit: {
      id: string;
      nom: string;
      prix: number;
      images: string[];
    };
    quantite: number;
    prixUnitaire: number;
  }>;
}

const DetailCommande: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommandeDetail = async () => {
      try {
        // Skip backend API call - use localStorage directly
        // const response = await api.get(`/api/client/commandes/${id}`);
        // setCommande(response.data);
        
        // Charger depuis localStorage
        const commandesLocales = JSON.parse(localStorage.getItem('fasomarket_commandes') || '[]');
        const commandeTrouvee = commandesLocales.find((cmd: any) => 
          cmd.id === id || cmd.id.toString() === id
        );
        
        if (commandeTrouvee) {
          setCommande({
            ...commandeTrouvee,
            items: commandeTrouvee.items || []
          });
        }
      } catch (error) {
        console.error('Erreur chargement detail commande:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandeDetail();
  }, [id]);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return '#f59e0b';
      case 'CONFIRMEE': return '#3b82f6';
      case 'PREPAREE': return '#8b5cf6';
      case 'EXPEDIEE': return '#06b6d4';
      case 'LIVREE': return '#10b981';
      case 'ANNULEE': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return <Clock size={20} />;
      case 'CONFIRMEE': case 'PREPAREE': case 'EXPEDIEE': return <Package size={20} />;
      case 'LIVREE': return <CheckCircle size={20} />;
      case 'ANNULEE': return <XCircle size={20} />;
      default: return <Package size={20} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Chargement des details...</div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Commande introuvable</h2>
        <button
          onClick={() => navigate('/client/commandes')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retour aux commandes
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/client/commandes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#2563eb',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={20} style={{ marginRight: '8px' }} />
          Retour aux commandes
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Commande #{commande.numeroCommande}
            </h1>
            <p style={{ color: '#6b7280' }}>
              Passee le {new Date(commande.dateCreation).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: `${getStatusColor(commande.statut)}20`,
            color: getStatusColor(commande.statut),
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {getStatusIcon(commande.statut)}
            {commande.statut.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Articles commandes</h2>
            </div>
            
            <div>
              {commande.items && commande.items.length > 0 ? (
                commande.items.filter(item => item && item.produit).map((item, index) => (
                  <div key={item.id} style={{
                    padding: '20px',
                    borderBottom: index < commande.items!.filter(i => i && i.produit).length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {item.produit?.images?.[0] ? (
                        <img
                          src={item.produit.images[0]}
                          alt={item.produit.nom || 'Produit'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={24} color="#9ca3af" />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {item.produit?.nom || 'Produit inconnu'}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        Quantite: {item.quantite} x {(item.prixUnitaire || 0).toLocaleString()} FCFA
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {((item.prixUnitaire || 0) * item.quantite).toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Aucun article trouve pour cette commande
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Resume</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Sous-total</span>
                <span style={{ fontWeight: '500' }}>{(commande.total - 1500).toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Livraison</span>
                <span style={{ fontWeight: '500' }}>1 500 FCFA</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                <span>Total</span>
                <span style={{ color: '#2563eb' }}>{commande.total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <MapPin size={16} style={{ marginRight: '8px' }} />
              Adresse de livraison
            </h3>
            <p style={{ color: '#374151', lineHeight: '1.5' }}>
              {commande.adresseLivraison}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <CreditCard size={16} style={{ marginRight: '8px' }} />
              Paiement
            </h3>
            <p style={{ color: '#374151' }}>
              {commande.methodePaiement === 'MOBILE_MONEY' ? 'Mobile Money' : 'Paiement a la livraison'}
            </p>
          </div>

          {commande.instructions && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Instructions de livraison
              </h3>
              <p style={{ color: '#374151', lineHeight: '1.5' }}>
                {commande.instructions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailCommande;