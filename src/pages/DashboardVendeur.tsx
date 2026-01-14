import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Package, ShoppingBag, Bell, Plus, TrendingUp } from 'lucide-react';
import { vendorService } from '../services/api';
import { useVendeurStore } from '../store/vendeur';
import type { Boutique, Produit, Commande } from '../types';

interface DashboardVendeurData {
  statistiques: {
    nouvellesCommandes: number;
    ventesAujourdhui: number;
    produitsEnStock: number;
    notificationsNonLues: number;
  };
  boutique: Boutique | null;
  commandesRecentes: Commande[];
  produitsRecents: Produit[];
}

export default function DashboardVendeur() {
  const [data, setData] = useState<DashboardVendeurData | null>(null);
  const [loading, setLoading] = useState(true);
  const { boutique } = useVendeurStore();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await vendorService.getDashboard();
        setData(response.data);
      } catch (error: any) {
        console.error('Erreur lors du chargement du dashboard vendeur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '2px solid #e5e7eb', 
          borderTop: '2px solid #16a34a', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Bannière de célébration */}
      <div style={{
        backgroundColor: '#dcfce7',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>
          Votre boutique est active !
        </h2>
        <p style={{ color: '#15803d' }}>
          Vous pouvez maintenant vendre vos produits
        </p>
      </div>

      {/* Statistiques */}
      {data?.statistiques && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <Package size={24} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Nouvelles commandes</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.nouvellesCommandes}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <span style={{ fontSize: '24px', color: '#d97706' }}>💰</span>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Ventes aujourd'hui</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.ventesAujourdhui} FCFA</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#e9d5ff', borderRadius: '8px' }}>
                <span style={{ fontSize: '24px', color: '#9333ea' }}>📊</span>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Produits en stock</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.produitsEnStock}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>🔥 Actions rapides</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <button
            onClick={() => window.location.href = '/vendeur/ajouter-produit'}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = 'none'}
          >
            ➕ Ajouter produit
          </button>
          
          <button
            onClick={() => window.location.href = '/vendeur/commandes'}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = 'none'}
          >
            📋 Voir commandes
          </button>
          
          <button
            onClick={() => window.location.href = '/vendeur/analytics'}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = 'none'}
          >
            📊 Statistiques
          </button>
        </div>
      </div>

      {/* Commandes récentes */}
      {data?.commandesRecentes && data.commandesRecentes.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📦 Commandes récentes</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {data.commandesRecentes.map(commande => (
              <div key={commande.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div>
                  <span style={{ fontWeight: '500' }}>#{commande.id.slice(0, 8)}</span>
                  <span style={{ marginLeft: '16px', color: '#6b7280' }}>{commande.total} FCFA</span>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: commande.statut === 'DELIVERED' ? '#dcfce7' : '#fef3c7',
                  color: commande.statut === 'DELIVERED' ? '#166534' : '#92400e'
                }}>
                  {commande.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
