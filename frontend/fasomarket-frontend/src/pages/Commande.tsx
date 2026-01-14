import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface CommandeDetail {
  id: number;
  numeroCommande: string;
  statut: string;
  total: number;
  dateCreation: string;
  adresseLivraison: string;
  items: Array<{
    id: number;
    produitNom: string;
    produitImage: string;
    quantite: number;
    prixUnitaire: number;
    boutique: string;
  }>;
  historique: Array<{
    statut: string;
    date: string;
    description: string;
  }>;
}

const Commande: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCommande();
    }
  }, [id]);

  const fetchCommande = async () => {
    try {
      const response = await api.get(`/api/client/commandes/${id}`);
      setCommande(response.data);
    } catch (error) {
      console.error('Erreur chargement commande:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Chargement de la commande...</div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Commande introuvable</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <Link
          to="/commandes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#2563eb',
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          Retour aux commandes
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Commande #{commande.numeroCommande}
            </h1>
            <p style={{ color: '#6b7280' }}>
              Passée le {new Date(commande.dateCreation).toLocaleDateString('fr-FR')}
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
            <Package size={16} />
            {commande.statut.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Articles commandés */}
        <div>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Articles commandés
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {commande.items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <img
                    src={item.produitImage || '/placeholder-product.jpg'}
                    alt={item.produitNom}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {item.produitNom}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                      Vendu par {item.boutique}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        Quantité: {item.quantite}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {(item.prixUnitaire * item.quantite).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suivi de commande */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Suivi de commande
            </h2>
            
            <div style={{ position: 'relative' }}>
              {commande.historique.map((etape, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(etape.statut),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CheckCircle size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {etape.statut.replace('_', ' ')}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                      {etape.description}
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(etape.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Résumé
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Sous-total</span>
                <span style={{ fontWeight: '500' }}>{(commande.total * 0.9).toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Livraison</span>
                <span style={{ fontWeight: '500' }}>{(commande.total * 0.1).toLocaleString()} FCFA</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  {commande.total.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Adresse de livraison
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <MapPin size={20} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#374151', lineHeight: '1.5' }}>
                {commande.adresseLivraison}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commande;