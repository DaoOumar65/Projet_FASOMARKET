import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Boxes,
  Truck
} from 'lucide-react';
import { useAuthStore } from '../store';

const sidebarItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/vendeur/dashboard' },
  { icon: Store, label: 'Ma boutique', path: '/vendeur/boutique' },
  { icon: Package, label: 'Mes produits', path: '/vendeur/produits' },
  { icon: Boxes, label: 'Gestion Stock', path: '/vendeur/gestion-stock' },
  { icon: Truck, label: 'Livraison', path: '/vendeur/gestion-livraison' },
  { icon: ShoppingBag, label: 'Commandes', path: '/vendeur/commandes' },
  { icon: BarChart3, label: 'Analytics', path: '/vendeur/analytics' },
  { icon: Settings, label: 'Paramètres', path: '/vendeur/parametres' },
];

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <Link to="/vendeur/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: '#2563eb',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>F</span>
          </div>
          <span style={{ fontSize: '19px', fontWeight: '700', color: '#111827' }}>FasoMarket</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
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
                padding: '12px 16px',
                marginBottom: '4px',
                color: isActive ? '#2563eb' : '#6b7280',
                textDecoration: 'none',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                borderRadius: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
              <span style={{ fontSize: '15px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#eff6ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <User size={18} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nomComplet}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Vendeur</p>
          </div>
        </div>
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
            borderRadius: '8px',
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
          zIndex: 30,
          overflowY: 'auto'
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: isDesktop ? 0 : 'auto' }}>
            <button style={{
              position: 'relative',
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6b7280'
            }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }}></span>
            </button>
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