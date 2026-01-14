import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, CreditCard, Bell } from 'lucide-react';
import { clientService } from '../services/api';
import type { Commande, Produit } from '../types';

interface DashboardData {
  statistiques: {
    commandesEnCours: number;
    commandesTerminees: number;
    montantTotalDepense: number;
    notificationsNonLues: number;
  };
  commandesRecentes: Commande[];
  recommandations: Produit[];
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Skip backend API call - use localStorage data
        const commandesLocales = JSON.parse(localStorage.getItem('fasomarket_commandes') || '[]');
        
        // Calculate statistics from localStorage
        const commandesEnCours = commandesLocales.filter((cmd: any) => 
          ['EN_ATTENTE', 'CONFIRMEE', 'PREPAREE', 'EXPEDIEE'].includes(cmd.statut)
        ).length;
        
        const commandesTerminees = commandesLocales.filter((cmd: any) => 
          cmd.statut === 'LIVREE'
        ).length;
        
        const montantTotalDepense = commandesLocales.reduce((total: number, cmd: any) => 
          total + (cmd.total || 0), 0
        );
        
        const dashboardData: DashboardData = {
          statistiques: {
            commandesEnCours,
            commandesTerminees,
            montantTotalDepense,
            notificationsNonLues: 0
          },
          commandesRecentes: commandesLocales.slice(0, 5),
          recommandations: []
        };
        
        setData(dashboardData);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        
        // Fallback data
        setData({
          statistiques: {
            commandesEnCours: 0,
            commandesTerminees: 0,
            montantTotalDepense: 0,
            notificationsNonLues: 0
          },
          commandesRecentes: [],
          recommandations: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* En-tête */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Mon Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Bienvenue sur votre espace client FasoMarket
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
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '8px',
                  marginRight: '16px'
                }}>
                  <ShoppingBag size={24} color="#2563eb" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>
                    Commandes en cours
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {data.statistiques.commandesEnCours}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '8px',
                  marginRight: '16px'
                }}>
                  <Package size={24} color="#059669" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>
                    Commandes terminées
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {data.statistiques.commandesTerminees}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#f3e8ff', 
                  borderRadius: '8px',
                  marginRight: '16px'
                }}>
                  <CreditCard size={24} color="#7c3aed" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>
                    Total dépensé
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {(data.statistiques.montantTotalDepense || 0).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '8px',
                  marginRight: '16px'
                }}>
                  <Bell size={24} color="#d97706" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>
                    Notifications
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {data.statistiques.notificationsNonLues}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <Link
            to="/panier"
            style={{
              display: 'block',
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <ShoppingBag size={32} color="#2563eb" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Mon Panier
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Voir les articles dans votre panier
            </p>
          </Link>

          <Link
            to="/boutiques"
            style={{
              display: 'block',
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Package size={32} color="#059669" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Boutiques
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Découvrir les boutiques
            </p>
          </Link>

          <Link
            to="/profil"
            style={{
              display: 'block',
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <CreditCard size={32} color="#7c3aed" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Mon Profil
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Gérer mes informations
            </p>
          </Link>
        </div>

        {/* Message de bienvenue */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <Package size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            Bienvenue sur FasoMarket !
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>
            Découvrez les meilleurs produits locaux et commencez vos achats dès maintenant.
          </p>
          <Link
            to="/boutiques"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Commencer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}