import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, Truck, ArrowLeft, Package, Grid } from 'lucide-react';
import { publicService } from '../services/api';
import AdresseMapSimple from '../components/AdresseMapSimple';
import type { Boutique, Produit } from '../types';

export default function DetailBoutique() {
  const { id } = useParams<{ id: string }>();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [produitsLoading, setProduitsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBoutique();
      fetchProduits();
    }
  }, [id]);

  const fetchBoutique = async () => {
    try {
      const response = await publicService.getBoutique(id!);
      console.log('Détail boutique:', response.data);
      
      // Mapper les données avec fallbacks
      const boutiqueData = {
        ...response.data,
        nom: response.data.nom || response.data.name || 'MaroShop',
        adresse: response.data.adresse || response.data.address || 'Adresse non disponible',
        telephone: response.data.telephone || response.data.phone || '',
        categorie: response.data.categorie || response.data.category || 'Mode',
        livraison: response.data.livraison || response.data.delivery || false,
        fraisLivraison: response.data.fraisLivraison || response.data.deliveryFee || 0
      };
      
      setBoutique(boutiqueData);
    } catch (error) {
      console.error('Erreur lors du chargement de la boutique:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await publicService.getBoutiqueProduits(id!);
      console.log('Produits boutique:', response.data);
      
      // Mapper les produits avec fallbacks
      const produitsFormates = (response.data || []).map((produit: any, index: number) => ({
        ...produit,
        nom: produit.nom || produit.name || `Produit ${index + 1}`,
        prix: produit.prix || produit.price || 15000,
        quantiteStock: produit.quantiteStock || produit.stock || 0,
        disponible: produit.disponible !== undefined ? produit.disponible : true,
        images: produit.images ? 
          (typeof produit.images === 'string' ? produit.images.split(',') : produit.images) : 
          ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400']
      }));
      
      setProduits(produitsFormates);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setProduitsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
    );
  }

  if (!boutique) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Store size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Boutique non trouvée
          </h2>
          <Link 
            to="/boutiques" 
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
          >
            Retour aux boutiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* En-tête de la boutique */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          paddingTop: '32px',
          paddingBottom: '32px'
        }}>
          <Link
            to="/boutiques"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Retour aux boutiques
          </Link>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '96px',
                height: '96px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Store size={48} style={{ color: 'white' }} />
              </div>
              
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h1 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  lineHeight: '1.2'
                }}>
                  {boutique.nom}
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '18px',
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  {boutique.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MapPin size={16} style={{ marginRight: '8px' }} />
                    {boutique.adresse}
                  </div>
                  {boutique.telephone && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Phone size={16} style={{ marginRight: '8px' }} />
                      {boutique.telephone}
                    </div>
                  )}
                  {boutique.email && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Mail size={16} style={{ marginRight: '8px' }} />
                      {boutique.email}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: boutique.statut === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                  color: boutique.statut === 'ACTIVE' ? '#166534' : '#374151'
                }}>
                  {boutique.statut === 'ACTIVE' ? 'Boutique active' : boutique.statut}
                </span>
                
                {boutique.livraison && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '12px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '14px'
                  }}>
                    <Truck size={16} style={{ marginRight: '8px' }} />
                    <span>Livraison: {boutique.fraisLivraison.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        paddingTop: '32px',
        paddingBottom: '32px'
      }}>
        {/* Informations de la boutique */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            À propos de cette boutique
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <h3 style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                Localisation
              </h3>
              <AdresseMapSimple 
                adresse={boutique.adresse}
                nom={boutique.nom}
              />
            </div>
            
            <div>
              <h3 style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                Catégorie
              </h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8'
              }}>
                {boutique.categorie}
              </span>
            </div>
            
            <div>
              <h3 style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                Livraison
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {boutique.livraison 
                  ? `Disponible - ${boutique.fraisLivraison.toLocaleString()} FCFA`
                  : 'Non disponible'
                }
              </p>
            </div>
            
            <div>
              <h3 style={{
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                Contact
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {boutique.telephone && <div>{boutique.telephone}</div>}
                {boutique.email && <div>{boutique.email}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Produits de la boutique */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Package size={20} style={{ marginRight: '8px' }} />
              Produits ({produits.length})
            </h2>
          </div>

          {produitsLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '32px 0'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : produits.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {produits.map((produit) => (
                <Link
                  key={produit.id}
                  to={`/produits/${produit.id}`}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ height: '192px', backgroundColor: '#f3f4f6' }}>
                    {produit.images && produit.images.length > 0 && produit.images[0] ? (
                      <img
                        src={typeof produit.images === 'string' ? produit.images.split(',')[0] : produit.images[0]}
                        alt={produit.nom || 'Produit'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Package size={48} style={{ color: '#9ca3af' }} />
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '8px',
                      fontSize: '16px',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {produit.nom || 'Produit sans nom'}
                    </h3>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#2563eb',
                      marginBottom: '8px'
                    }}>
                      {produit.prix ? `${produit.prix.toLocaleString()} FCFA` : 'Prix non disponible'}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: produit.disponible ? '#dcfce7' : '#fef2f2',
                        color: produit.disponible ? '#166534' : '#dc2626'
                      }}>
                        {produit.disponible ? 'Disponible' : 'Rupture'}
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        Stock: {produit.quantiteStock || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 20px'
            }}>
              <Package size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                Aucun produit disponible
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Cette boutique n'a pas encore ajouté de produits
              </p>
            </div>
          )}
        </div>
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