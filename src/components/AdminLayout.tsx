import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store';
import { useNotificationStore } from '../store/notifications';
import { adminService } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const sidebarItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/utilisateurs', badge: 'utilisateurs' },
  { icon: Shield, label: 'Validations', path: '/admin/validations', badge: 'validations' },
  { icon: Store, label: 'Boutiques', path: '/admin/boutiques', badge: 'boutiques' },
  { icon: Package, label: 'Produits', path: '/admin/produits', badge: 'produits' },
  { icon: ShoppingBag, label: 'Commandes', path: '/admin/commandes', badge: 'commandes' },
  { icon: Settings, label: 'Paramètres', path: '/admin/parametres' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [badges, setBadges] = useState({ 
    utilisateurs: 0, 
    validations: 0, 
    boutiques: 0, 
    produits: 0, 
    commandes: 0 
  });
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { fetchUnreadCount } = useNotificationStore();

  // Charger les badges depuis l'API
  const fetchBadges = async () => {
    try {
      const response = await adminService.getBadges();
      setBadges(response.data || { 
        utilisateurs: 0, 
        validations: 0, 
        boutiques: 0, 
        produits: 0, 
        commandes: 0 
      });
    } catch (error) {
      console.error('Erreur chargement badges:', error);
      setBadges({ 
        utilisateurs: 0, 
        validations: 0, 
        boutiques: 0, 
        produits: 0, 
        commandes: 0 
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    fetchUnreadCount(); // Charger les notifications
    fetchBadges(); // Charger les badges
    
    // Actualiser les badges toutes les 30 secondes
    const interval = setInterval(fetchBadges, 30000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#dc2626',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>A</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => !isDesktop && setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                color: isActive ? '#dc2626' : '#6b7280',
                textDecoration: 'none',
                backgroundColor: isActive ? '#fef2f2' : 'transparent',
                borderRight: isActive ? '3px solid #dc2626' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                  (e.target as HTMLElement).style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLElement).style.color = '#6b7280';
                }
              }}
            >
              <Icon size={20} style={{ marginRight: '12px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
              {item.badge && badges[item.badge] > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {badges[item.badge] > 9 ? '9+' : badges[item.badge]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#fee2e2';
            (e.target as HTMLElement).style.borderColor = '#fecaca';
            (e.target as HTMLElement).style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
            (e.target as HTMLElement).style.borderColor = '#e5e7eb';
            (e.target as HTMLElement).style.color = '#6b7280';
          }}
        >
          <LogOut size={16} style={{ marginRight: '8px' }} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Mobile sidebar */}
      {!isDesktop && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: sidebarOpen ? 0 : '-280px',
            width: '280px',
            height: '100vh',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            transition: 'left 0.3s ease',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <SidebarContent />
          </div>
          
          {/* Overlay */}
          {sidebarOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 40
              }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Desktop sidebar */}
      {isDesktop && (
        <div style={{
          width: '280px',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30
        }}>
          <SidebarContent />
        </div>
      )}

      {/* Main content */}
      <div style={{ 
        flex: 1, 
        marginLeft: isDesktop ? '280px' : '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top navbar */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <NotificationDropdown />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#dc2626',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {user?.nomComplet}
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Administrateur</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}