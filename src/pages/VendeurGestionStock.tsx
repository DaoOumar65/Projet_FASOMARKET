import { useState, useEffect } from 'react';
import { Package, TrendingDown, AlertTriangle, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { vendorService, getVariantesProduit } from '../services/api';
import toast from 'react-hot-toast';

interface Variante {
  id: number;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
}

interface Produit {
  id: string;
  nom: string;
  prix: number;
  quantiteStock: number;
  seuilAlerte: number;
  images: string[];
  disponible: boolean;
  variantes?: Variante[];
}

export default function VendeurGestionStock() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editSeuil, setEditSeuil] = useState<number>(5);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [editingVariante, setEditingVariante] = useState<{produitId: string, varianteId: number} | null>(null);
  const [editVarianteStock, setEditVarianteStock] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Utiliser l'endpoint de gestion du stock
      const res = await vendorService.getGestionStock();
      console.log('Gestion stock data:', res.data);
      
      // Le backend retourne une structure avec produits et statistiques
      const produitsData = res.data.produits || [];
      
      // Charger les variantes pour chaque produit
      const produitsAvecVariantes = await Promise.all(
        (Array.isArray(produitsData) ? produitsData : []).map(async (produit: any) => {
          try {
            const variantes = await getVariantesProduit(produit.id);
            return {
              id: produit.id || '',
              nom: produit.nom || produit.name || 'Produit sans nom',
              prix: produit.prix || produit.price || 0,
              quantiteStock: produit.quantiteStock || produit.stock || 0,
              seuilAlerte: produit.seuilAlerte || produit.alertThreshold || 5,
              images: produit.images ? 
                (typeof produit.images === 'string' ? produit.images.split(',').filter(Boolean) : produit.images) : 
                ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
              disponible: produit.disponible !== undefined ? produit.disponible : true,
              variantes
            };
          } catch (error) {
            console.error(`Erreur chargement variantes pour ${produit.id}:`, error);
            return {
              id: produit.id || '',
              nom: produit.nom || produit.name || 'Produit sans nom',
              prix: produit.prix || produit.price || 0,
              quantiteStock: produit.quantiteStock || produit.stock || 0,
              seuilAlerte: produit.seuilAlerte || produit.alertThreshold || 5,
              images: produit.images ? 
                (typeof produit.images === 'string' ? produit.images.split(',').filter(Boolean) : produit.images) : 
                ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
              disponible: produit.disponible !== undefined ? produit.disponible : true,
              variantes: []
            };
          }
        })
      );
      
      setProduits(produitsAvecVariantes);
      
    } catch (error) {
      console.error('Erreur chargement gestion stock:', error);
      
      // Fallback: utiliser l'endpoint des produits standard
      try {
        const res = await vendorService.getProduits();
        const produitsData = Array.isArray(res.data) ? res.data.map((produit: any) => ({
          id: produit.id || '',
          nom: produit.nom || produit.name || 'Produit sans nom',
          prix: produit.prix || produit.price || 0,
          quantiteStock: produit.quantiteStock || produit.stock || produit.stockQuantity || 0,
          seuilAlerte: produit.seuilAlerte || produit.alertThreshold || 5,
          images: produit.images ? 
            (typeof produit.images === 'string' ? produit.images.split(',').filter(Boolean) : produit.images) : 
            ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
          disponible: produit.disponible !== undefined ? produit.disponible : true,
          variantes: []
        })) : [];
        
        setProduits(produitsData);
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
        // Données de test en dernier recours
        setProduits([
          {
            id: '1',
            nom: 'Chemise Traditionnelle',
            prix: 15000,
            quantiteStock: 10,
            seuilAlerte: 5,
            images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
            disponible: true,
            variantes: [
              { id: 1, couleur: 'Rouge', taille: 'M', prixAjustement: 0, stock: 3 },
              { id: 2, couleur: 'Bleu', taille: 'L', prixAjustement: 1000, stock: 2 }
            ]
          },
          {
            id: '2',
            nom: 'Pantalon Bogolan',
            prix: 25000,
            quantiteStock: 2,
            seuilAlerte: 5,
            images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
            disponible: true,
            variantes: []
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditStock = (produit: Produit) => {
    setEditingId(produit.id);
    setEditStock(produit.quantiteStock);
    setEditSeuil(produit.seuilAlerte || 5);
  };

  const handleSaveStock = async (produitId: string) => {
    try {
      await vendorService.updateStock(produitId, {
        quantiteStock: editStock,
        seuilAlerte: editSeuil
      });
      
      setProduits(produits.map(p => 
        p.id === produitId 
          ? { ...p, quantiteStock: editStock, seuilAlerte: editSeuil }
          : p
      ));
      
      setEditingId(null);
      toast.success('Stock mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSaveVarianteStock = async (produitId: string, varianteId: number) => {
    try {
      await vendorService.updateVariante(produitId, varianteId, { stock: editVarianteStock });
      
      setProduits(produits.map(p => 
        p.id === produitId 
          ? {
              ...p,
              variantes: p.variantes?.map(v => 
                v.id === varianteId ? { ...v, stock: editVarianteStock } : v
              )
            }
          : p
      ));
      
      setEditingVariante(null);
      toast.success('Stock variante mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleProductExpansion = (produitId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(produitId)) {
      newExpanded.delete(produitId);
    } else {
      newExpanded.add(produitId);
    }
    setExpandedProducts(newExpanded);
  };

  const produitsEnRupture = produits.filter(p => p.quantiteStock === 0);
  const produitsAlerte = produits.filter(p => p.quantiteStock > 0 && p.quantiteStock <= (p.seuilAlerte || 5));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>📦 Gestion du Stock</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>Suivez et gérez vos stocks en temps réel</p>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '20px', 
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <Package size={24} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Total produits</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>{produits.length}</p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          padding: '20px', 
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <TrendingDown size={24} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Stock faible</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>{produitsAlerte.length}</p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
          padding: '20px', 
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <AlertTriangle size={24} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Rupture de stock</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>{produitsEnRupture.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes Stock */}
      {(produitsEnRupture.length > 0 || produitsAlerte.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {produitsEnRupture.length > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', 
              border: '1px solid rgba(255, 154, 158, 0.3)', 
              borderRadius: '16px', 
              padding: '20px',
              boxShadow: '0 8px 32px rgba(255, 154, 158, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <AlertTriangle size={20} color="#dc2626" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#7f1d1d', margin: 0 }}>Rupture de stock</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>{produitsEnRupture.length} produit(s) en rupture</p>
            </div>
          )}
          
          {produitsAlerte.length > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
              border: '1px solid rgba(252, 182, 159, 0.3)', 
              borderRadius: '16px', 
              padding: '20px',
              boxShadow: '0 8px 32px rgba(252, 182, 159, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <TrendingDown size={20} color="#d97706" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', margin: 0 }}>Stock faible</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#a16207', margin: 0 }}>{produitsAlerte.length} produit(s) sous le seuil</p>
            </div>
          )}
        </div>
      )}

      {/* Liste des produits */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '20px', 
        padding: '32px', 
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Produit</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Prix</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Stock actuel</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Ventes</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Modifier stock</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit) => (
                <>
                  <tr key={produit.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={(produit.images && produit.images.length > 0) ? produit.images[0] : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'}
                          alt={produit.nom}
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400';
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{produit.nom}</span>
                            {produit.variantes && produit.variantes.length > 0 && (
                              <button
                                onClick={() => toggleProductExpansion(produit.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                {expandedProducts.has(produit.id) ? 
                                  <ChevronDown size={16} color="#6b7280" /> : 
                                  <ChevronRight size={16} color="#6b7280" />
                                }
                              </button>
                            )}
                          </div>
                          {produit.variantes && produit.variantes.length > 0 && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {produit.variantes.length} variante(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>
                      {produit.prix.toLocaleString()} FCFA
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {editingId === produit.id ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          style={{
                            width: '80px',
                            padding: '6px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}
                        />
                      ) : (
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: produit.quantiteStock === 0 ? '#dc2626' : produit.quantiteStock <= (produit.seuilAlerte || 5) ? '#d97706' : '#10b981'
                        }}>
                          {produit.quantiteStock} unités
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                      0
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {editingId === produit.id ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleSaveStock(produit.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditStock(produit)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            margin: '0 auto'
                          }}
                        >
                          <Edit2 size={14} />
                          Modifier
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {/* Variantes */}
                  {expandedProducts.has(produit.id) && produit.variantes && produit.variantes.map((variante) => (
                    <tr key={`${produit.id}-${variante.id}`} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', paddingLeft: '80px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '4px', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}></div>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            {[variante.couleur, variante.taille, variante.modele].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                        {(produit.prix + variante.prixAjustement).toLocaleString()} FCFA
                        {variante.prixAjustement !== 0 && (
                          <span style={{ marginLeft: '4px', fontSize: '11px', color: variante.prixAjustement > 0 ? '#059669' : '#dc2626' }}>
                            ({variante.prixAjustement > 0 ? '+' : ''}{variante.prixAjustement.toLocaleString()})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {editingVariante?.produitId === produit.id && editingVariante?.varianteId === variante.id ? (
                          <input
                            type="number"
                            value={editVarianteStock}
                            onChange={(e) => setEditVarianteStock(Number(e.target.value))}
                            style={{
                              width: '60px',
                              padding: '4px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '12px'
                            }}
                          />
                        ) : (
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: variante.stock === 0 ? '#dc2626' : variante.stock <= 3 ? '#d97706' : '#059669'
                          }}>
                            {variante.stock} unités
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>0</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {editingVariante?.produitId === produit.id && editingVariante?.varianteId === variante.id ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleSaveVarianteStock(produit.id, variante.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              <Save size={12} />
                            </button>
                            <button
                              onClick={() => setEditingVariante(null)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingVariante({ produitId: produit.id, varianteId: variante.id });
                              setEditVarianteStock(variante.stock);
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              margin: '0 auto'
                            }}
                          >
                            <Edit2 size={10} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
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