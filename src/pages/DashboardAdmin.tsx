import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { adminService } from '../services/api';

interface DashboardAdminData {
  statistiques: {
    totalUtilisateurs: number;
    totalVendeurs: number;
    totalClients: number;
    totalBoutiques: number;
    boutiquesActives: number;
    boutiquesEnAttente: number;
    totalProduits: number;
    totalCommandes: number;
    commandesAujourdhui: number;
    chiffreAffairesTotal: number;
    chiffreAffairesMois: number;
  };
  vendeursEnAttente: any[];
  boutiquesEnAttente: any[];
  commandesRecentes: any[];
  alertes: any[];
}

interface Utilisateur {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function DashboardAdmin() {
  const [data, setData] = useState<DashboardAdminData | null>(null);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Vérifier l'authentification
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const user = localStorage.getItem('user');
      
      console.log('Auth check:', { token: !!token, userId, user });
      
      if (!token || !userId) {
        setError('Non authentifié - Veuillez vous connecter');
        setLoading(false);
        return;
      }
      
      try {
        const [dashboardResponse, utilisateursResponse] = await Promise.all([
          adminService.getDashboard(),
          adminService.getUtilisateurs(undefined, 0, 10)
        ]);
        
        console.log('Dashboard response:', dashboardResponse.data);
        setData(dashboardResponse.data);
        setUtilisateurs(utilisateursResponse.data.utilisateurs || utilisateursResponse.data.content || utilisateursResponse.data || []);
        console.log('Utilisateurs chargés:', utilisateursResponse.data);
        setError(null);
      } catch (error: any) {
        console.error('Erreur dashboard admin:', error);
        setError(
          error.response?.status === 404 
            ? 'Endpoint dashboard non trouvé - Vérifiez que /api/admin/dashboard existe'
            : error.response?.status === 500
            ? `Erreur serveur: ${error.response?.data?.message || 'Vérifiez les logs Spring Boot'}`
            : error.message || 'Erreur lors du chargement des données'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '2px solid #e5e7eb', 
          borderTop: '2px solid #dc2626', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Dashboard Administrateur</h1>
        <p style={{ color: '#6b7280' }}>Vue d'ensemble de la plateforme FasoMarket</p>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={20} style={{ color: '#d97706' }} />
          <span style={{ color: '#92400e' }}>{error}</span>
        </div>
      )}

      {/* Statistiques principales */}
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
                <Users size={24} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Utilisateurs</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.totalUtilisateurs.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <Store size={24} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Boutiques</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.totalBoutiques.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <Package size={24} style={{ color: '#d97706' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Produits</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.totalProduits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <Package size={24} style={{ color: '#dc2626' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Commandes</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{data.statistiques.totalCommandes.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertes et validations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        {/* Validations en attente */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>⏳ Validations en attente</h2>
              <Link
                to="/admin/validations"
                style={{ fontSize: '14px', color: '#dc2626', textDecoration: 'none', fontWeight: '500' }}
              >
                Voir tout
              </Link>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            {data?.vendeursEnAttente && data.vendeursEnAttente.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.vendeursEnAttente.slice(0, 3).map((vendeur, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>
                        {vendeur.user?.fullName || vendeur.nom || 'Vendeur'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>En attente de validation</p>
                    </div>
                    <Clock size={16} style={{ color: '#d97706' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
                <p style={{ color: '#6b7280' }}>Aucune validation en attente</p>
              </div>
            )}
          </div>
        </div>

        {/* Utilisateurs récents */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>  
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>👥 Utilisateurs récents</h2>
              <Link
                to="/admin/utilisateurs"
                style={{ fontSize: '14px', color: '#dc2626', textDecoration: 'none', fontWeight: '500' }}
              >
                Voir tout
              </Link>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            {utilisateurs && utilisateurs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {utilisateurs.slice(0, 5).map((utilisateur) => (
                  <div key={utilisateur.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>
                        {utilisateur.fullName}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {utilisateur.phone} • {utilisateur.role}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: utilisateur.isActive ? '#dcfce7' : '#fef3c7',
                        color: utilisateur.isActive ? '#16a34a' : '#d97706'
                      }}>
                        {utilisateur.isActive ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Users size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                <p style={{ color: '#6b7280' }}>Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '32px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📊 Activité récente</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px', color: '#374151' }}>Système initialisé</span>
              <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>Maintenant</span>
            </div>
            {data && data.statistiques.totalUtilisateurs > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '14px', color: '#374151' }}>{data.statistiques.totalUtilisateurs} utilisateurs inscrits</span>
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>Récent</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <Link
          to="/admin/validations"
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
        >
          <CheckCircle size={32} style={{ color: '#16a34a', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les validations</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Valider vendeurs et boutiques</p>
        </Link>

        <Link
          to="/admin/utilisateurs"
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
        >
          <Users size={32} style={{ color: '#2563eb', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les utilisateurs</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Voir et modérer les comptes</p>
        </Link>

        <Link
          to="/admin/boutiques"
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
        >
          <Store size={32} style={{ color: '#16a34a', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les boutiques</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Superviser les boutiques</p>
        </Link>
      </div>
    </div>
  );
}
