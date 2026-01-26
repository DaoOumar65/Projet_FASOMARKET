import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, Store } from 'lucide-react';

interface Stats {
  utilisateurs: number;
  produits: number;
  commandes: number;
  boutiques: number;
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<Stats>({ utilisateurs: 0, produits: 0, commandes: 0, boutiques: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch('http://localhost:8081/api/admin/statistiques', {
          headers: { 'X-User-Id': userId || '' }
        });
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Dashboard Administrateur</h1>
        <p style={{ color: '#6b7280' }}>Vue d'ensemble de la plateforme FasoMarket</p>
      </div>

      {/* Statistiques principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <Users size={24} style={{ color: '#2563eb' }} />
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Utilisateurs</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.utilisateurs.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
              <Package size={24} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Produits</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.produits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <ShoppingCart size={24} style={{ color: '#d97706' }} />
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Commandes</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.commandes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
              <Store size={24} style={{ color: '#dc2626' }} />
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Boutiques</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.boutiques.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <Link to="/admin/utilisateurs" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', textDecoration: 'none', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
          <Users size={32} style={{ color: '#2563eb', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les utilisateurs</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Voir et modérer les comptes</p>
        </Link>

        <Link to="/admin/produits" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', textDecoration: 'none', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
          <Package size={32} style={{ color: '#16a34a', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les produits</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Superviser le catalogue</p>
        </Link>

        <Link to="/admin/commandes" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', textDecoration: 'none', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
          <ShoppingCart size={32} style={{ color: '#d97706', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les commandes</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Suivre les transactions</p>
        </Link>

        <Link to="/admin/boutiques" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', textDecoration: 'none', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
          <Store size={32} style={{ color: '#dc2626', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Gérer les boutiques</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Superviser les boutiques</p>
        </Link>
      </div>
    </div>
  );
}
