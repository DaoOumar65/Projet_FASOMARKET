import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, Settings, Package, Heart, MapPin, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store';
import { usePanier } from '../contexts/PanierContext';
import NotificationDropdown from './NotificationDropdown';

const decodeHTML = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { panierItems } = usePanier();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getTotalItems = () => {
    return panierItems.reduce((total, item) => total + item.quantite, 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'CLIENT':
        return '/dashboard';
      case 'VENDOR':
        return '/vendeur/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <header style={{ 
      backgroundColor: '#ffffff', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 50 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: '48px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              backgroundColor: '#2563eb', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '14px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }}>
              <span style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '20px'
              }}>F</span>
            </div>
            <span style={{ 
              fontSize: '26px', 
              fontWeight: '700',
              color: '#1f2937',
              letterSpacing: '-0.3px'
            }}>FasoMarket</span>
          </Link>

          {/* Navigation desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
            <Link 
              to="/produits" 
              style={{ 
                color: '#374151', 
                textDecoration: 'none', 
                fontWeight: '500',
                fontSize: '16px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#374151'}
            >
              Produits
            </Link>
            <Link 
              to="/boutiques" 
              style={{ 
                color: '#374151', 
                textDecoration: 'none', 
                fontWeight: '500',
                fontSize: '16px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#374151'}
            >
              Boutiques
            </Link>
            <Link 
              to="/categories" 
              style={{ 
                color: '#374151', 
                textDecoration: 'none', 
                fontWeight: '500',
                fontSize: '16px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#374151'}
            >
              Catégories
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

                {/* Panier (pour les clients) */}
                {user?.role === 'CLIENT' && (
                  <Link 
                    to="/panier" 
                    style={{ 
                      position: 'relative', 
                      padding: '8px', 
                      textDecoration: 'none',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <ShoppingCart size={24} color="#374151" />
                    {getTotalItems() > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                )}

                {/* Menu utilisateur */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <User size={18} />
                    <span>{user?.nomComplet ? decodeHTML(user.nomComplet) : 'Utilisateur'}</span>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                      minWidth: '200px',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '8px 0' }}>
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Package size={16} />
                          Dashboard
                        </Link>
                        {user?.role === 'CLIENT' && (
                          <>
                            <Link
                              to="/client/commandes"
                              onClick={() => setIsUserMenuOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                color: '#374151',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <ShoppingBag size={16} />
                              Mes commandes
                            </Link>
                            <Link
                              to="/favoris"
                              onClick={() => setIsUserMenuOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                color: '#374151',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <Heart size={16} />
                              Mes favoris
                            </Link>
                            <Link
                              to="/adresses"
                              onClick={() => setIsUserMenuOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                color: '#374151',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <MapPin size={16} />
                              Mes adresses
                            </Link>
                          </>
                        )}
                        <Link
                          to="/profil"
                          onClick={() => setIsUserMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Settings size={16} />
                          Profil
                        </Link>
                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }}></div>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '12px 16px',
                            color: '#ef4444',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/connexion" 
                  style={{ 
                    padding: '8px 16px', 
                    color: '#374151', 
                    textDecoration: 'none', 
                    fontWeight: '500',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Connexion
                </Link>
                <Link 
                  to="/inscription" 
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    borderRadius: '8px', 
                    textDecoration: 'none', 
                    fontWeight: '500', 
                    fontSize: '14px',
                    transition: 'background-color 0.2s' 
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  S'inscrire
                </Link>
              </>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: 'none',
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              {isMenuOpen ? <X size={24} color="#374151" /> : <Menu size={24} color="#374151" />}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer les menus */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40
          }}
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}