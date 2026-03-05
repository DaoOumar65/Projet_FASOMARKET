import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, Settings, Package, Heart, MapPin, ShoppingBag, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store';
import { usePanier } from '../hooks/usePanier';
import NotificationDropdown from './NotificationDropdown';
import ClientNotificationDropdown from './ClientNotificationDropdown';
import ThemeToggle from './ThemeToggle';

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const navigate = useNavigate();

  // Charger les données pour les dropdowns
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        // Catégories
        const catsRes = await fetch('http://localhost:8081/api/public/categories').then(r => r.json()).catch(() => []);
        setCategories(Array.isArray(catsRes) ? catsRes.slice(0, 5) : [
          { id: 1, nom: 'Mode & Vêtements' },
          { id: 2, nom: 'Électronique' },
          { id: 3, nom: 'Alimentation' },
          { id: 4, nom: 'Maison & Jardin' },
          { id: 5, nom: 'Sport & Loisirs' }
        ]);

        // Boutiques
        const boutiquesRes = await fetch('http://localhost:8081/api/public/boutiques').then(r => r.json()).catch(() => []);
        setBoutiques(Array.isArray(boutiquesRes) ? boutiquesRes.slice(0, 5) : [
          { id: 1, nom: 'Fashion Ouaga', description: 'Mode et accessoires' },
          { id: 2, nom: 'TechStore BF', description: 'Électronique' },
          { id: 3, nom: 'Marché Central', description: 'Alimentation' },
          { id: 4, nom: 'Artisanat BF', description: 'Artisanat local' },
          { id: 5, nom: 'Sport Plus', description: 'Articles de sport' }
        ]);

        // Produits populaires
        const produitsRes = await fetch('http://localhost:8081/api/public/produits').then(r => r.json()).catch(() => []);
        setProduits(Array.isArray(produitsRes) ? produitsRes.slice(0, 5) : [
          { id: 1, nom: 'Smartphone Samsung', prix: 180000 },
          { id: 2, nom: 'Robe Traditionnelle', prix: 25000 },
          { id: 3, nom: 'Ordinateur Portable', prix: 350000 },
          { id: 4, nom: 'Chaussures Nike', prix: 45000 },
          { id: 5, nom: 'Sac à Main', prix: 15000 }
        ]);
      } catch (error) {
        console.error('Erreur chargement données dropdown:', error);
      }
    };
    
    chargerDonnees();
  }, []);

  const getTotalItems = () => {
    if (!Array.isArray(panierItems)) return 0;
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
      backgroundColor: 'var(--bg-primary)', 
      boxShadow: 'var(--shadow)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: '32px', flexShrink: 0 }}>
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
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>FasoMarket</span>
          </Link>

          {/* Navigation desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {[
              { 
                to: '/produits', 
                label: 'Produits',
                dropdown: produits.map(p => ({ 
                  to: `/produit/${p.id}`, 
                  label: p.nom, 
                  subtitle: `${p.prix?.toLocaleString()} FCFA` 
                }))
              },
              { 
                to: '/boutiques', 
                label: 'Boutiques',
                dropdown: boutiques.map(b => ({ 
                  to: `/boutique/${b.id}`, 
                  label: b.nom, 
                  subtitle: b.description 
                }))
              },
              { 
                to: '/categories', 
                label: 'Catégories',
                dropdown: categories.map(c => ({ 
                  to: `/produits?categorie=${c.nom}`, 
                  label: c.nom 
                }))
              }
            ].map((item, index) => (
              <div 
                key={index}
                style={{ position: 'relative' }}
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.to} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 16px',
                    color: 'var(--text-secondary)', 
                    textDecoration: 'none', 
                    fontWeight: '500',
                    fontSize: '15px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: activeDropdown === item.label ? 'var(--bg-tertiary)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--blue-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  {item.label}
                  <ChevronDown size={14} style={{ 
                    transform: activeDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </Link>
                
                {/* Dropdown Menu */}
                {activeDropdown === item.label && item.dropdown.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      marginTop: '4px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                      minWidth: '280px',
                      zIndex: 200,
                      padding: '8px 0'
                    }}
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div style={{
                      padding: '8px 16px',
                      borderBottom: '1px solid #e2e8f0',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {item.label} populaires
                      </span>
                    </div>
                    {item.dropdown.map((dropItem, idx) => (
                      <Link
                        key={idx}
                        to={dropItem.to}
                        style={{
                          display: 'block',
                          padding: '14px 20px',
                          color: '#374151',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          borderRadius: '8px',
                          margin: '2px 8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f1f5f9';
                          e.target.style.color = '#2563eb';
                          e.target.style.transform = 'translateX(4px)';
                          e.target.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#374151';
                          e.target.style.transform = 'translateX(0px)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          marginBottom: '3px',
                          transition: 'color 0.2s ease'
                        }}>
                          {dropItem.label}
                        </div>
                        {dropItem.subtitle && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            {dropItem.subtitle}
                          </div>
                        )}
                      </Link>
                    ))}
                    <div style={{
                      borderTop: '1px solid #e2e8f0',
                      marginTop: '8px',
                      padding: '8px 16px'
                    }}>
                      <Link
                        to={item.to}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          margin: '0 8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1d4ed8';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#2563eb';
                          e.target.style.transform = 'translateY(0px)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        Voir tout →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions utilisateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', flexShrink: 0 }}>
            {isAuthenticated ? (
              <>
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
                    <ShoppingCart size={24} color="var(--text-secondary)" />
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

                {/* Notifications */}
                {user?.role === 'CLIENT' ? <ClientNotificationDropdown /> : <NotificationDropdown />}

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Menu utilisateur avec rôle */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <User size={18} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>
                        {user?.nomComplet ? decodeHTML(user.nomComplet) : 'Utilisateur'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '400' }}>
                        {user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'VENDOR' ? 'Vendeur' : 'Client'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-lg)',
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
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
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
                            color: 'var(--red-primary)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--red-secondary)'}
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
                    color: 'var(--text-secondary)', 
                    textDecoration: 'none', 
                    fontWeight: '500',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Connexion
                </Link>
                <Link 
                  to="/inscription" 
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: 'var(--blue-primary)', 
                    color: 'white', 
                    borderRadius: '8px', 
                    textDecoration: 'none', 
                    fontWeight: '500', 
                    fontSize: '14px',
                    transition: 'background-color 0.2s' 
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--blue-primary)'}
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
            setActiveDropdown(null);
          }}
        />
      )}
    </header>
  );
}