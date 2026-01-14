import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, MapPin, Truck, Plus, AlertCircle } from 'lucide-react';
import { publicService } from '../services/api';
import AdresseMapSimple from '../components/AdresseMapSimple';
import type { Boutique } from '../types';

const decodeHTML = (text: string) => {
  if (!text) return '';
  
  // Méthode plus robuste pour décoder HTML
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
};

export default function Boutiques() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setError(null);
      const response = await publicService.getBoutiques();
      console.log('Boutiques chargées:', response.data);
      console.log('Première boutique:', response.data[0]);
      
      // Mapper les données de l'API vers notre interface
      const boutiquesFormatees = (response.data || []).map((boutique: any) => {
        console.log('Boutique brute:', boutique);
        console.log('Nom de la boutique:', boutique.nom);
        
        return {
          id: boutique.id,
          nom: boutique.nom || boutique.name || 'MaroShop', // Fallback vers MaroShop
          description: boutique.description || '',
          adresse: boutique.address || boutique.adresse || '',
          telephone: boutique.phone || boutique.telephone || '',
          email: boutique.email || '',
          categorie: boutique.category || boutique.categorie || '',
          livraison: boutique.delivery || false,
          fraisLivraison: boutique.deliveryFee || 0,
          statut: boutique.status || boutique.statut || 'ACTIVE',
          note: boutique.rating || 0,
          nombreAvis: boutique.reviewsCount || 0,
          logoUrl: boutique.logoUrl || null,
          bannerUrl: boutique.bannerUrl || null
        };
      });
      
      console.log('Boutiques formatées:', boutiquesFormatees);
      setBoutiques(boutiquesFormatees);
    } catch (error: any) {
      console.error('Erreur lors du chargement des boutiques:', error);
      console.error('Détails de la réponse:', error.response?.data);
      
      // Message d'erreur plus informatif
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setError('Le serveur backend n\'est pas accessible. Assurez-vous qu\'il est démarré sur le port 8081.');
      } else if (error.response?.status === 404) {
        setError('L\'endpoint /api/public/boutiques n\'est pas encore implémenté côté backend.');
      } else if (error.response?.status === 500) {
        const backendError = error.response?.data?.message || error.response?.data?.error || 'Erreur interne du serveur';
        setError(`Erreur serveur (500): ${backendError}. Vérifiez les logs du backend Spring Boot pour plus de détails.`);
        console.error('Erreur 500 détaillée:', error.response?.data);
      } else {
        setError(error.response?.data?.message || 'Erreur lors du chargement des boutiques.');
      }
      
      setBoutiques([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(boutiques.map(b => b.categorie).filter(Boolean))];

  const filteredBoutiques = boutiques.filter(boutique => {
    if (!boutique) return false;
    
    const nom = boutique.nom || '';
    const description = boutique.description || '';
    const categorie = boutique.categorie || '';
    
    const matchesSearch = searchTerm === '' || 
                         nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || categorie === selectedCategory;
    return matchesSearch && matchesCategory;
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
        {/* En-tête amélioré */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '16px'
          }}>
            Nos Boutiques Partenaires
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280', 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            {boutiques.length > 0 
              ? `Découvrez ${boutiques.length} boutique${boutiques.length > 1 ? 's' : ''} de confiance`
              : 'Explorez notre sélection de boutiques de qualité'
            }
          </p>

          {/* Filtres améliorés */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', gap: '16px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Recherche */}
              <div style={{ position: 'relative', flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une boutique..."
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

              {/* Filtre par catégorie */}
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    minWidth: '200px'
                  }}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              )}
            </div>
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
                onClick={fetchBoutiques}
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

        {/* Grille des boutiques */}
        {filteredBoutiques.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {filteredBoutiques.map((boutique) => (
              <Link
                key={boutique.id}
                to={`/boutiques/${boutique.id}`}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.3s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                {/* Image de couverture */}
                <div style={{
                  height: '160px',
                  background: boutique.bannerUrl 
                    ? `url(${boutique.bannerUrl}) center/cover` 
                    : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {!boutique.bannerUrl && (
                    <Store size={48} style={{ color: 'white', opacity: 0.8 }} />
                  )}
                  
                  {/* Logo de la boutique */}
                  {boutique.logoUrl && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '20px',
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      <img 
                        src={boutique.logoUrl} 
                        alt={`Logo ${boutique.nom}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderRadius: '6px',
                      backgroundColor: boutique.statut === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                      color: boutique.statut === 'ACTIVE' ? '#166534' : '#92400e'
                    }}>
                      {boutique.statut === 'ACTIVE' ? 'Actif' : boutique.statut}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div style={{ padding: boutique.logoUrl ? '30px 20px 20px' : '20px' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {decodeHTML(boutique.nom)}
                  </h3>

                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {boutique.description ? decodeHTML(boutique.description) : 'Aucune description'}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      <MapPin size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {boutique.adresse}
                      </span>
                    </div>
                    
                    {/* Composant adresse intégré */}
                    <div style={{ marginBottom: '12px' }}>
                      <AdresseMapSimple 
                        adresse={boutique.adresse}
                        nom={boutique.nom}
                      />
                    </div>
                    
                    {boutique.livraison && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#059669'
                      }}>
                        <Truck size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                        <span>Livraison ({boutique.fraisLivraison?.toLocaleString() || 0} FCFA)</span>
                      </div>
                    )}
                    
                    {/* Note et avis */}
                    {(boutique.note > 0 || boutique.nombreAvis > 0) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        color: '#f59e0b',
                        marginTop: '4px'
                      }}>
                        <span style={{ marginRight: '4px' }}>⭐</span>
                        <span>{boutique.note.toFixed(1)} ({boutique.nombreAvis} avis)</span>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {boutique.categorie && (
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
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
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0'
                        }}>
                          📞 Contactable
                        </span>
                      )}
                    </div>
                    
                    <span style={{
                      color: '#2563eb',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Découvrir
                      <span style={{ fontSize: '16px' }}>→</span>
                    </span>
                  </div>
                </div>
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
            <Store size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              {searchTerm || selectedCategory ? 'Aucune boutique trouvée' : 'Aucune boutique disponible'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {searchTerm || selectedCategory 
                ? 'Essayez avec d\'autres mots-clés ou changez les filtres'
                : 'Les boutiques apparaîtront ici une fois qu\'elles seront ajoutées'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
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
                Réinitialiser les filtres
              </button>
            )}
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