import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { usePanier } from '../contexts/PanierContext';

export default function Panier() {
  const { panierItems, total, loading, supprimerDuPanier, modifierQuantite, viderPanier } = usePanier();
  const navigate = useNavigate();

  const getTotalItems = () => {
    return panierItems
      .filter(item => item && item.produit && typeof item.quantite === 'number')
      .reduce((total, item) => total + item.quantite, 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Chargement du panier...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '48px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Mon Panier</h1>
          <p style={{ fontSize: '20px', color: '#6b7280' }}>
            {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        {panierItems.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '64px',
            textAlign: 'center',
            maxWidth: '512px',
            margin: '0 auto'
          }}>
            <ShoppingBag size={80} color="#9ca3af" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Votre panier est vide</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '18px' }}>Découvrez nos produits et ajoutez-les à votre panier</p>
            <Link
              to="/boutiques"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '16px 32px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '600',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.2s'
              }}
            >
              Découvrir les boutiques
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
            {/* Articles du panier */}
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '24px 32px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Articles sélectionnés</h2>
                    <button
                      onClick={viderPanier}
                      style={{
                        color: '#dc2626',
                        fontWeight: '500',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.color = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#dc2626';
                      }}
                    >
                      Vider le panier
                    </button>
                  </div>
                </div>

                <div>
                  {panierItems.filter(item => item && item.produit).map((item, index) => (
                    <div key={item.id} style={{
                      padding: '32px',
                      borderBottom: index < panierItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* Image produit */}
                        <div style={{
                          width: '96px',
                          height: '96px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                          {item.produit?.images?.[0] ? (
                            <img
                              src={item.produit.images[0]}
                              alt={item.produit.nom || 'Produit'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ShoppingBag size={40} color="#9ca3af" />
                            </div>
                          )}
                        </div>

                        {/* Informations produit */}
                        <div style={{ flex: 1 }}>
                          <Link
                            to={`/produits/${item.produit?.id || ''}`}
                            style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#111827',
                              textDecoration: 'none',
                              display: 'block',
                              marginBottom: '8px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.color = '#111827'}
                          >
                            {item.produit?.nom || 'Produit inconnu'}
                          </Link>
                          <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                            Vendu par <span style={{ fontWeight: '500' }}>{item.produit?.boutique?.nom || 'Boutique inconnue'}</span>
                          </p>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                            {(item.produit?.prix || 0).toLocaleString()} FCFA
                            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>l'unité</span>
                          </div>
                        </div>

                        {/* Contrôles quantité */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
                            <button 
                              onClick={() => modifierQuantite(item.id, item.quantite - 1)}
                              style={{
                                padding: '12px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <Minus size={20} color="#6b7280" />
                            </button>
                            <div style={{
                              padding: '12px 24px',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              minWidth: '64px',
                              textAlign: 'center'
                            }}>
                              {item.quantite}
                            </div>
                            <button 
                              onClick={() => modifierQuantite(item.id, item.quantite + 1)}
                              style={{
                                padding: '12px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              <Plus size={20} color="#6b7280" />
                            </button>
                          </div>
                          <button
                            onClick={() => supprimerDuPanier(item.id)}
                            style={{
                              color: '#dc2626',
                              padding: '8px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#fef2f2';
                              e.target.style.color = '#b91c1c';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#dc2626';
                            }}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {/* Prix total */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
                            {((item.produit?.prix || 0) * item.quantite).toLocaleString()} FCFA
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé de commande */}
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '32px',
                position: 'sticky',
                top: '32px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Résumé de commande</h2>
                
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ fontSize: '18px', color: '#6b7280' }}>Sous-total</span>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>{(total || 0).toLocaleString()} FCFA</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ fontSize: '18px', color: '#6b7280' }}>Articles</span>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>{getTotalItems() || 0}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{ fontSize: '18px', color: '#6b7280' }}>Livraison</span>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>Gratuite</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#eff6ff',
                    margin: '0 -16px',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Total</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                      {(total || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={() => navigate('/commande')}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '16px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      fontSize: '18px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Passer la commande
                    <ArrowRight size={24} />
                  </button>

                  <Link
                    to="/boutiques"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      border: '2px solid #d1d5db',
                      color: '#374151',
                      fontWeight: '600',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '18px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#93c5fd';
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.color = '#374151';
                    }}
                  >
                    Continuer mes achats
                  </Link>
                </div>

                {/* Garanties */}
                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '16px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px'
                    }}>
                      <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '14px' }}>Paiement</div>
                      <div style={{ color: '#065f46', fontSize: '12px' }}>100% Sécurisé</div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '16px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px'
                    }}>
                      <div style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>Livraison</div>
                      <div style={{ color: '#1e40af', fontSize: '12px' }}>Rapide & Gratuite</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}