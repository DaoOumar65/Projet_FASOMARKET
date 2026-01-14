import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store';
import axios from 'axios';

interface Commande {
  id: number;
  numeroCommande: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'PREPAREE' | 'EXPEDIEE' | 'LIVREE' | 'ANNULEE';
  total: number;
  dateCreation: string;
  nombreArticles: number;
}

const ClientCommandes: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('TOUTES');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:8081/api/client/commandes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': userId
        }
      });
      
      const commandesAPI = response.data.map((cmd: any) => ({
        id: cmd.id,
        numeroCommande: cmd.id.slice(-8),
        statut: cmd.status,
        total: cmd.totalAmount,
        dateCreation: cmd.createdAt,
        nombreArticles: cmd.orderItems?.length || 0
      }));
      
      setCommandes(commandesAPI);
      
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      // Fallback vers localStorage
      const commandesLocales = JSON.parse(localStorage.getItem('fasomarket_commandes') || '[]');
      setCommandes(commandesLocales);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'PAID': return '#8b5cf6';
      case 'SHIPPED': return '#06b6d4';
      case 'DELIVERED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'PENDING': return <Clock size={16} />;
      case 'CONFIRMED': case 'PAID': case 'SHIPPED': return <Package size={16} />;
      case 'DELIVERED': return <CheckCircle size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const filteredCommandes = filter === 'TOUTES' 
    ? commandes 
    : commandes.filter(c => c.statut === filter);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Chargement de vos commandes...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Mes Commandes
        </h1>
        <p style={{ color: '#6b7280' }}>Suivez l'état de vos commandes</p>
      </div>

      {/* Filtres */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {['TOUTES', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: filter === status ? '#2563eb' : 'white',
              color: filter === status ? 'white' : '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {status === 'TOUTES' ? 'Toutes' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Liste des commandes */}
      {filteredCommandes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <Package size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Aucune commande trouvée
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {filter === 'TOUTES' ? 'Vous n\'avez pas encore passé de commande' : `Aucune commande ${filter.toLowerCase()}`}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCommandes.map(commande => (
            <div
              key={commande.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    Commande #{commande.numeroCommande}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {new Date(commande.dateCreation).toLocaleDateString('fr-FR')} • {commande.nombreArticles} article(s)
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: `${getStatusColor(commande.statut)}20`,
                    color: getStatusColor(commande.statut),
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    {getStatusIcon(commande.statut)}
                    {commande.statut.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {commande.total.toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  to={`/commande/${commande.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#f8fafc',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                >
                  <Eye size={14} />
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientCommandes;