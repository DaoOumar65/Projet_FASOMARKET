import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Package, Store, Grid, MapPin, Truck, Star } from 'lucide-react';
import { publicService } from '../services/api';
import AdresseMapSimple from '../components/AdresseMapSimple';
import type { Produit, Boutique, Categorie } from '../types';

interface SearchResults {
  boutiques: Boutique[];
  produits: Produit[];
  categories: Categorie[];
}

export default function Recherche() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'produits' | 'boutiques' | 'categories'>('all');
  
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, type]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await publicService.recherche(query, type);
      setResults(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab !== 'all') {
      setSearchParams({ q: query, type: tab });
    } else {
      setSearchParams({ q: query });
    }
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return results.produits.length + results.boutiques.length + results.categories.length;
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Rechercher sur FasoMarket</h1>
            <p className="text-gray-600">Utilisez la barre de recherche pour trouver des produits, boutiques ou catégories</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* En-tête de recherche moderne */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            <Search size={16} />
            Résultats de recherche
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            Recherche pour <span style={{ color: '#2563eb' }}>"</span>
            <span style={{ color: '#2563eb' }}>{query}</span>
            <span style={{ color: '#2563eb' }}>"</span>
          </h1>
          {results && (
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {getTotalResults()} résultat{getTotalResults() > 1 ? 's' : ''} trouvé{getTotalResults() > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Onglets de filtrage modernes */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '6px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'Tout', count: getTotalResults(), icon: Search },
              { key: 'produits', label: 'Produits', count: results?.produits.length || 0, icon: Package },
              { key: 'boutiques', label: 'Boutiques', count: results?.boutiques.length || 0, icon: Store },
              { key: 'categories', label: 'Catégories', count: results?.categories.length || 0, icon: Grid }
            ].map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key as typeof activeTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeTab === key ? '#2563eb' : 'transparent',
                  color: activeTab === key ? 'white' : '#64748b'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== key) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f1f5f9';
                    (e.target as HTMLButtonElement).style.color = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== key) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#64748b';
                  }
                }}
              >
                <Icon size={16} />
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '80px 0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : results ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '40px'
                }}>
            {/* Produits en liste compacte */}
            {(activeTab === 'all' || activeTab === 'produits') && results.produits.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Package size={24} style={{ color: '#2563eb' }} />
                  Produits
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {results.produits.map((produit) => (
                    <Link
                      key={produit.id}
                      to={`/produits/${produit.id}`}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        textDecoration: 'none',
                        color: 'inherit',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      {/* Image produit */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#f8fafc'
                      }}>
                        {produit.images && produit.images[0] ? (
                          <img
                            src={produit.images[0]}
                            alt={produit.nom}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Package size={24} style={{ color: '#9ca3af' }} />
                          </div>
                        )}
                      </div>

                      {/* Informations produit */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#0f172a',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px'
                          }}>
                            {produit.nom}
                          </h3>
                          
                          <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#2563eb',
                            flexShrink: 0
                          }}>
                            {produit.prix.toLocaleString()} FCFA
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            <Store size={14} />
                            <span>{produit.boutique?.nom || 'Boutique inconnue'}</span>
                          </div>

                          {produit.categorie && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8'
                            }}>
                              {produit.categorie}
                            </span>
                          )}

                          {produit.stock !== undefined && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: produit.stock > 0 ? '#dcfce7' : '#fee2e2',
                              color: produit.stock > 0 ? '#166534' : '#dc2626'
                            }}>
                              {produit.stock > 0 ? `${produit.stock} en stock` : 'Rupture'}
                            </span>
                          )}

                          {produit.description && (
                            <span style={{
                              fontSize: '13px',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}>
                              {produit.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flèche */}
                      <div style={{
                        color: '#2563eb',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Boutiques en liste compacte */}
            {(activeTab === 'all' || activeTab === 'boutiques') && results.boutiques.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Store size={24} style={{ color: '#2563eb' }} />
                  Boutiques
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {results.boutiques.map((boutique) => (
                    <Link
                      key={boutique.id}
                      to={`/boutiques/${boutique.id}`}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        textDecoration: 'none',
                        color: 'inherit',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      {/* Icône boutique */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Store size={24} style={{ color: 'white' }} />
                      </div>

                      {/* Informations principales */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#0f172a',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px'
                          }}>
                            {boutique.nom}
                          </h3>
                          
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <span style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRadius: '6px',
                              backgroundColor: '#dcfce7',
                              color: '#166534'
                            }}>
                              Actif
                            </span>
                            {boutique.livraison && (
                              <span style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                borderRadius: '6px',
                                backgroundColor: '#f0fdf4',
                                color: '#166534',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <Truck size={12} />
                                Livraison
                              </span>
                            )}
                          </div>
                        </div>

                        <p style={{
                          color: '#64748b',
                          fontSize: '14px',
                          margin: '0 0 12px 0',
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {boutique.description || 'Aucune description'}
                        </p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          {/* Adresse avec Maps */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            <MapPin size={14} />
                            <AdresseMapSimple 
                              adresse={boutique.adresse || 'Adresse non disponible'}
                              nom={boutique.nom}
                            />
                          </div>

                          {boutique.categorie && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8'
                            }}>
                              {boutique.categorie}
                            </span>
                          )}

                          {boutique.telephone && (
                            <span style={{
                              fontSize: '13px',
                              color: '#64748b'
                            }}>
                              📞 {boutique.telephone}
                            </span>
                          )}

                          {boutique.email && (
                            <span style={{
                              fontSize: '13px',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '150px'
                            }}>
                              ✉️ {boutique.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flèche */}
                      <div style={{
                        color: '#2563eb',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Catégories en liste compacte */}
            {(activeTab === 'all' || activeTab === 'categories') && results.categories.length > 0 && (
              <section>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Grid size={24} style={{ color: '#2563eb' }} />
                  Catégories
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {results.categories.map((categorie) => (
                    <Link
                      key={categorie.id}
                      to={`/categories/${categorie.id}`}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        textDecoration: 'none',
                        color: 'inherit',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      {/* Icône catégorie */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Grid size={24} style={{ color: 'white' }} />
                      </div>

                      {/* Informations catégorie */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {categorie.nom}
                        </h3>
                        
                        {categorie.description && (
                          <p style={{
                            color: '#64748b',
                            fontSize: '14px',
                            margin: '8px 0 0 0',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {categorie.description}
                          </p>
                        )}
                        
                        {/* Informations supplémentaires */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '8px',
                          flexWrap: 'wrap'
                        }}>
                          {categorie.nombreProduits !== undefined && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: '#f0fdf4',
                              color: '#166534'
                            }}>
                              {categorie.nombreProduits} produit{categorie.nombreProduits > 1 ? 's' : ''}
                            </span>
                          )}
                          
                          {categorie.statut && (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: categorie.statut === 'active' ? '#dcfce7' : '#fee2e2',
                              color: categorie.statut === 'active' ? '#166534' : '#dc2626'
                            }}>
                              {categorie.statut === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flèche */}
                      <div style={{
                        color: '#2563eb',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Aucun résultat moderne */}
            {getTotalResults() === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #f1f5f9'
              }}>
                <Search size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Aucun résultat trouvé
                </h3>
                <p style={{
                  color: '#64748b',
                  marginBottom: '24px',
                  fontSize: '16px'
                }}>
                  Essayez avec d'autres mots-clés ou parcourez nos catégories
                </p>
                <Link
                  to="/categories"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Voir les catégories
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
