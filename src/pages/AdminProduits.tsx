import { useState, useEffect } from 'react';
import { Package, Search, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  status: 'ACTIVE' | 'HIDDEN' | 'BLOCKED_BY_ADMIN';
  images?: string[];
  boutique: {
    nom: string;
    vendeur: {
      nomComplet: string;
    };
  };
  dateCreation: string;
  details?: {
    taille?: string[];
    couleur?: string[];
    marque?: string;
    matiere?: string;
    poids?: string;
    dimensions?: string;
    garantie?: string;
    origine?: string;
  };
}

export default function AdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showBlockModal, setShowBlockModal] = useState<string | null>(null);
  const [blockComment, setBlockComment] = useState('');

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      // Récupérer TOUS les produits (y compris masqués et bloqués)
      const response = await adminService.getProduits(0, 100);
      console.log('Produits admin chargés:', response.data);
      
      const data = response.data.produits || response.data.content || response.data || [];
      
      // Mapper les données avec fallbacks et images
      const produitsFormates = Array.isArray(data) ? data.map((produit: any) => {
        // Gérer les images - utiliser les vraies URLs du backend
        let images = [];
        if (produit.images) {
          if (typeof produit.images === 'string') {
            images = produit.images.split(',').map((img: string) => img.trim()).filter(Boolean);
          } else if (Array.isArray(produit.images)) {
            images = produit.images.filter(Boolean);
          }
        }
        
        return {
          id: produit.id || '',
          nom: produit.nom || produit.name || 'Produit sans nom',
          description: produit.description || 'Aucune description',
          prix: produit.prix || produit.price || 0,
          stock: produit.stock || produit.stockQuantity || produit.quantiteStock || 0,
          status: produit.status || produit.statut || 'ACTIVE',
          images: images,
          boutique: {
            nom: produit.boutique?.nom || produit.shopName || produit.nomBoutique || 'MaroShop',
            vendeur: {
              nomComplet: produit.boutique?.vendeur?.nomComplet || produit.vendorName || produit.nomVendeur || 'Vendeur MaroShop'
            }
          },
          dateCreation: produit.dateCreation || produit.createdAt || new Date().toISOString()
        };
      }) : [];
      
      setProduits(produitsFormates);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      // Données de test en cas d'erreur
      setProduits([
        {
          id: '1',
          nom: 'Chemise Traditionnelle',
          description: 'Belle chemise en coton traditionnel',
          prix: 15000,
          stock: 10,
          status: 'ACTIVE' as const,
          images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
          boutique: {
            nom: 'MaroShop',
            vendeur: {
              nomComplet: 'Vendeur MaroShop'
            }
          },
          dateCreation: '2026-01-13T13:21:07.654288'
        },
        {
          id: '2',
          nom: 'Pantalon Bogolan',
          description: 'Pantalon en tissu bogolan authentique',
          prix: 25000,
          stock: 5,
          status: 'ACTIVE' as const,
          images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
          boutique: {
            nom: 'MaroShop',
            vendeur: {
              nomComplet: 'Vendeur MaroShop'
            }
          },
          dateCreation: '2026-01-13T13:21:07.654288'
        },
        {
          id: '3',
          nom: 'Boubou Élégant',
          description: 'Boubou brodé pour occasions spéciales',
          prix: 45000,
          stock: 3,
          status: 'ACTIVE' as const,
          images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
          boutique: {
            nom: 'MaroShop',
            vendeur: {
              nomComplet: 'Vendeur MaroShop'
            }
          },
          dateCreation: '2026-01-13T13:21:07.654288'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const changerStatutProduit = async (produitId: string, nouveauStatut: string) => {
    setActionLoading(produitId);
    try {
      await adminService.updateProduitStatut(produitId, nouveauStatut);
      toast.success(`Produit ${nouveauStatut === 'ACTIVE' ? 'activé' : 'masqué'}`);
      fetchProduits();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(null);
    }
  };





  const supprimerProduit = async (produitId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    setActionLoading(produitId);
    try {
      await adminService.supprimerProduit(produitId);
      toast.success('Produit supprimé');
      fetchProduits();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProduits = Array.isArray(produits) ? produits.filter(produit => {
    if (!produit) return false;
    
    const nom = produit.nom || '';
    const boutiqueName = produit.boutique?.nom || '';
    const vendeurName = produit.boutique?.vendeur?.nomComplet || '';
    
    const matchesSearch = nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
           boutiqueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vendeurName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || produit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatutBadge = (status: string) => {
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
        color: status === 'ACTIVE' ? '#16a34a' : '#dc2626'
      }}>
        {status === 'ACTIVE' ? 'Actif' : 'Masqué'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Gestion des produits</h1>
          <p style={{ color: '#6b7280' }}>{filteredProduits.length} produits trouvés</p>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Rechercher par nom, boutique ou vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="HIDDEN">Masqués</option>
            <option value="BLOCKED_BY_ADMIN">Bloqués</option>
          </select>
        </div>
        
        <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
          {filteredProduits.length} produit(s) • 
          {produits.filter(p => p.status === 'ACTIVE').length} actifs • 
          {produits.filter(p => p.status === 'HIDDEN').length} masqués • 
          {produits.filter(p => p.status === 'BLOCKED_BY_ADMIN').length} bloqués
        </div>
      </div>

      {/* Liste des produits */}
      {filteredProduits.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Package size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Aucun produit trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredProduits.map((produit) => (
            <div key={produit.id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.3s ease'
            }}>
              {/* Image du produit */}
              <div style={{
                height: '120px',
                backgroundColor: '#f8fafc',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {produit.images && produit.images.length > 0 ? (
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
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6'
                  }}>
                    <Package size={48} style={{ color: '#9ca3af' }} />
                  </div>
                )}
                
                {/* Badge statut */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px'
                }}>
                  {getStatutBadge(produit.status)}
                </div>
              </div>

              {/* Contenu */}
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {produit.nom || 'Produit sans nom'}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {produit.description}
                  </p>
                </div>
                
                {/* Prix et stock */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#2563eb'
                    }}>
                      {produit.prix ? produit.prix.toLocaleString() : '0'} FCFA
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Package size={16} style={{ color: '#6b7280' }} />
                    <span style={{
                      fontSize: '14px',
                      color: produit.stock > 5 ? '#059669' : produit.stock > 0 ? '#d97706' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {produit.stock || 0} en stock
                    </span>
                  </div>
                </div>
                
                {/* Informations boutique/vendeur */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6b7280'
                  }}>
                    <span>🏦</span>
                    <span>{produit.boutique?.nom || 'Boutique inconnue'}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6b7280'
                  }}>
                    <span>👤</span>
                    <span>{produit.boutique?.vendeur?.nomComplet || 'Vendeur inconnu'}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6b7280',
                    gridColumn: 'span 2'
                  }}>
                    <span>📅</span>
                    <span>{new Date(produit.dateCreation).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {/* Détails produit */}
                {produit.details && (produit.details.taille?.length || produit.details.couleur?.length || produit.details.marque) && (
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {produit.details.marque && (
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          🏷️ {produit.details.marque}
                        </span>
                      )}
                      {produit.details.taille && produit.details.taille.length > 0 && (
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '4px'
                        }}>
                          📏 {produit.details.taille.slice(0, 3).join(', ')}{produit.details.taille.length > 3 ? '...' : ''}
                        </span>
                      )}
                      {produit.details.couleur && produit.details.couleur.length > 0 && (
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '4px'
                        }}>
                          🎨 {produit.details.couleur.slice(0, 3).join(', ')}{produit.details.couleur.length > 3 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {produit.status === 'ACTIVE' ? (
                    <button
                      onClick={() => changerStatutProduit(produit.id, 'HIDDEN')}
                      disabled={actionLoading === produit.id}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                    >
                      <Ban size={16} />
                      Masquer
                    </button>
                  ) : (
                    <button
                      onClick={() => changerStatutProduit(produit.id, 'ACTIVE')}
                      disabled={actionLoading === produit.id}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dcfce7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                      }}
                    >
                      <CheckCircle size={16} />
                      Activer
                    </button>
                  )}
                  
                  <button
                    onClick={() => supprimerProduit(produit.id)}
                    disabled={actionLoading === produit.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
