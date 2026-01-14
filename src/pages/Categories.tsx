import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Grid, TrendingUp, Search, AlertCircle, Package } from 'lucide-react';
import { publicService } from '../services/api';
import type { Categorie } from '../types';

export default function Categories() {
  const { id } = useParams();
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await publicService.getCategories();
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
      setError('Impossible de charger les catégories.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(categorie => {
    if (!categorie || !categorie.nom) return false;
    const matchesSearch = categorie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categorie.description && categorie.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

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
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Nos Catégories
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '32px'
          }}>
            {categories.length > 0
              ? `Découvrez ${categories.length} catégorie${categories.length > 1 ? 's' : ''} de produits`
              : 'Explorez notre sélection de catégories'
            }
          </p>

          {/* Barre de recherche */}
          <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une catégorie..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <Search size={20} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
          </div>
        </div>

        {/* Gestion des erreurs */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
            <div>
              <p style={{ color: '#dc2626', fontWeight: '500' }}>Erreur de chargement</p>
              <p style={{ color: '#7f1d1d', fontSize: '14px' }}>{error}</p>
              <button
                onClick={fetchCategories}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Grille des catégories */}
        {filteredCategories.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '48px'
          }}>
            {filteredCategories.map((categorie) => (
              <Link
                key={categorie.id}
                to={`/categories/${categorie.id}`}
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '2px solid #f1f5f9',
                  transition: 'all 0.3s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  transition: 'background-color 0.3s ease'
                }}>
                  {categorie.icone ? (
                    <span style={{ fontSize: '32px' }}>{categorie.icone}</span>
                  ) : (
                    <Grid size={32} style={{ color: '#2563eb' }} />
                  )}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  {categorie.nom}
                </h3>
                {categorie.description && (
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {categorie.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #f1f5f9'
          }}>
            <Package size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie disponible'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {searchTerm
                ? 'Essayez avec d\'autres mots-clés'
                : 'Les catégories apparaîtront ici une fois qu\'elles seront ajoutées'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        )}

        {/* Section populaires */}
        {searchTerm === '' && categories.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
              justifyContent: 'center'
            }}>
              <TrendingUp size={24} style={{ color: '#f59e0b', marginRight: '12px' }} />
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                Catégories Populaires
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {categories.slice(0, 6).map((categorie) => (
                <Link
                  key={`popular-${categorie.id}`}
                  to={`/categories/${categorie.id}`}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px',
                    borderRadius: '16px',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {categorie.icone ? (
                      <span style={{ fontSize: '28px' }}>{categorie.icone}</span>
                    ) : (
                      <Grid size={28} style={{ color: 'white' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {categorie.nom}
                    </h3>
                    {categorie.description && (
                      <p style={{
                        fontSize: '14px',
                        opacity: 0.9,
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {categorie.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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