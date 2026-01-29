import { useEffect, useState } from 'react';
import React from 'react';
import { Package, AlertTriangle, TrendingUp, ChevronDown, ChevronRight, Edit2, Save, X } from 'lucide-react';
import { vendorService, getVariantesProduit } from '../services/api';
import toast from 'react-hot-toast';

interface Variante {
  id: number;
  couleur?: string;
  taille?: string;
  modele?: string;
  capacite?: string;
  puissance?: string;
  prixAjustement: number;
  stock: number;
}

interface Produit {
  id: string;
  nom: string;
  stock: number;
  prix: number;
  images?: string[] | null;
  nombreVentes: number;
  seuilAlerte?: number;
  variantes?: Variante[];
}

export default function GestionStock() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editSeuil, setEditSeuil] = useState<number>(5);
  const [editingVariante, setEditingVariante] = useState<{produitId: string, varianteId: number} | null>(null);
  const [editVarianteStock, setEditVarianteStock] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduits();
  }, []);

  const getDefaultImage = (produitNom: string) => {
    const nom = produitNom.toLowerCase();
    if (nom.includes('chemise') || nom.includes('shirt')) {
      return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400';
    }
    if (nom.includes('pantalon') || nom.includes('jean') || nom.includes('pants')) {
      return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400';
    }
    if (nom.includes('boubou') || nom.includes('robe') || nom.includes('dress')) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
    }
    if (nom.includes('chaussure') || nom.includes('shoe') || nom.includes('basket')) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400';
    }
    if (nom.includes('sac') || nom.includes('bag')) {
      return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400';
    }
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
  };

  const fetchProduits = async () => {
    try {
      // Utiliser l'endpoint de gestion du stock avec variantes
      const response = await vendorService.getGestionStock();
      console.log('Données gestion stock:', response.data);
      
      const produitsData = response.data.produits || response.data || [];
      
      // Charger les variantes pour chaque produit
      const produitsAvecVariantes = await Promise.all(
        (Array.isArray(produitsData) ? produitsData : []).map(async (produit: any) => {
          try {
            const variantes = await getVariantesProduit(produit.id);
            
            // Gérer les images
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
              stock: Number(produit.quantiteStock || produit.stock) || 0,
              prix: Number(produit.prix) || 0,
              nombreVentes: Number(produit.nombreVentes) || 0,
              seuilAlerte: Number(produit.seuilAlerte || produit.alertThreshold) || 5,
              images,
              variantes
            };
          } catch (error) {
            console.error(`Erreur variantes pour ${produit.id}:`, error);
            return {
              id: produit.id || '',
              nom: produit.nom || produit.name || 'Produit sans nom',
              stock: Number(produit.quantiteStock || produit.stock) || 0,
              prix: Number(produit.prix) || 0,
              nombreVentes: Number(produit.nombreVentes) || 0,
              seuilAlerte: Number(produit.seuilAlerte || produit.alertThreshold) || 5,
              images: produit.images ? 
                (typeof produit.images === 'string' ? produit.images.split(',').filter(Boolean) : produit.images) : [],
              variantes: []
            };
          }
        })
      );
      
      setProduits(produitsAvecVariantes);
      
    } catch (error) {
      console.error('Erreur:', error);
      // Fallback vers l'ancien endpoint
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch('http://localhost:8081/api/vendeur/produits', {
          headers: { 'X-User-Id': userId || '' }
        });
        if (response.ok) {
          const data = await response.json();
          const produitsConverted = data.map((p: any) => {
            let images = [];
            if (p.images) {
              if (typeof p.images === 'string') {
                images = p.images.split(',').map((img: string) => img.trim()).filter(Boolean);
              } else if (Array.isArray(p.images)) {
                images = p.images.filter(Boolean);
              }
            }
            
            return {
              ...p,
              images,
              stock: Number(p.quantiteStock || p.stock) || 0,
              prix: Number(p.prix) || 0,
              nombreVentes: Number(p.nombreVentes) || 0,
              seuilAlerte: 5,
              variantes: []
            };
          });
          setProduits(produitsConverted);
        }
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
        // Données de test pour démonstration
        setProduits([
          {
            id: '1',
            nom: 'Chemise Traditionnelle',
            stock: 15,
            prix: 12000,
            nombreVentes: 8,
            seuilAlerte: 5,
            images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
            variantes: [
              { id: 1, couleur: 'Blanc', taille: 'M', prixAjustement: 0, stock: 5 },
              { id: 2, couleur: 'Bleu', taille: 'L', prixAjustement: 1000, stock: 3 },
              { id: 3, couleur: 'Rouge', taille: 'XL', prixAjustement: 1500, stock: 2 }
            ]
          },
          {
            id: '2',
            nom: 'Pantalon Bogolan',
            stock: 8,
            prix: 18000,
            nombreVentes: 12,
            seuilAlerte: 3,
            images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
            variantes: [
              { id: 4, couleur: 'Marron', taille: '32', prixAjustement: 0, stock: 4 },
              { id: 5, couleur: 'Noir', taille: '34', prixAjustement: 2000, stock: 2 }
            ]
          },
          {
            id: '3',
            nom: 'Boubou Élégant',
            stock: 2,
            prix: 35000,
            nombreVentes: 5,
            seuilAlerte: 5,
            images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
            variantes: []
          },
          {
            id: '4',
            nom: 'Chaussures Cuir',
            stock: 0,
            prix: 25000,
            nombreVentes: 3,
            seuilAlerte: 2,
            images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'],
            variantes: [
              { id: 6, couleur: 'Noir', taille: '42', prixAjustement: 0, stock: 0 },
              { id: 7, couleur: 'Marron', taille: '43', prixAjustement: 3000, stock: 0 }
            ]
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (produitId: string, newStock: number, newSeuil?: number) => {
    try {
      console.log('Mise à jour stock:', { produitId, newStock, newSeuil });
      
      await vendorService.updateStock(produitId, {
        quantiteStock: newStock,
        seuilAlerte: newSeuil || 5
      });
      
      toast.success('Stock mis à jour avec succès');
      fetchProduits();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleEditStock = (produit: Produit) => {
    setEditingId(produit.id);
    setEditStock(produit.stock);
    setEditSeuil(produit.seuilAlerte || 5);
  };

  const handleSaveStock = async (produitId: string) => {
    await updateStock(produitId, editStock, editSeuil);
    setEditingId(null);
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

  const filteredProduits = produits.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock <= (p.seuilAlerte || 5);
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const stats = {
    total: produits.length,
    low: produits.filter(p => p.stock > 0 && p.stock <= (p.seuilAlerte || 5)).length,
    out: produits.filter(p => p.stock === 0).length
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>📦 Gestion du Stock</h1>
        <p style={{ color: '#6b7280' }}>Suivez et gérez vos stocks en temps réel</p>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '12px'
            }}>
              <Package size={24} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Total produits</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '12px'
            }}>
              <AlertTriangle size={24} color="#d97706" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Stock faible</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.low}</p>
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee2e2', 
              borderRadius: '12px'
            }}>
              <AlertTriangle size={24} color="#dc2626" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, marginBottom: '4px' }}>Rupture de stock</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stats.out}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: filter === 'all' ? '#2563eb' : 'white',
            color: filter === 'all' ? 'white' : '#6b7280',
            boxShadow: filter === 'all' ? '0 4px 6px rgba(37, 99, 235, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          Tous ({stats.total})
        </button>
        <button
          onClick={() => setFilter('low')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: filter === 'low' ? '#f59e0b' : 'white',
            color: filter === 'low' ? 'white' : '#6b7280',
            boxShadow: filter === 'low' ? '0 4px 6px rgba(245, 158, 11, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          ⚠️ Stock faible ({stats.low})
        </button>
        <button
          onClick={() => setFilter('out')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: filter === 'out' ? '#ef4444' : 'white',
            color: filter === 'out' ? 'white' : '#6b7280',
            boxShadow: filter === 'out' ? '0 4px 6px rgba(239, 68, 68, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          🚫 Rupture ({stats.out})
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Produit</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prix</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock actuel</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seuil alerte</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ventes</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((produit) => (
              <React.Fragment key={produit.id}>
                <tr style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={(produit.images && produit.images[0]) || getDefaultImage(produit.nom)}
                        alt={produit.nom}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb' }}
                        onError={(e) => {
                          e.currentTarget.src = getDefaultImage(produit.nom);
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#111827' }}>{produit.nom}</span>
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
                  <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: '600', color: '#2563eb' }}>{produit.prix.toLocaleString()} FCFA</td>
                  <td style={{ padding: '16px 24px' }}>
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
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        backgroundColor: produit.stock === 0 ? '#fee2e2' : produit.stock <= (produit.seuilAlerte || 5) ? '#fef3c7' : '#dcfce7',
                        color: produit.stock === 0 ? '#dc2626' : produit.stock <= (produit.seuilAlerte || 5) ? '#d97706' : '#16a34a'
                      }}>
                        {produit.stock} unités
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {editingId === produit.id ? (
                      <input
                        type="number"
                        value={editSeuil}
                        onChange={(e) => setEditSeuil(Number(e.target.value))}
                        style={{
                          width: '60px',
                          padding: '6px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{produit.seuilAlerte || 5}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={16} style={{ color: '#16a34a' }} />
                      <span style={{ fontWeight: '500', color: '#111827' }}>{produit.nombreVentes || 0}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {editingId === produit.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleSaveStock(produit.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Save size={14} /> Sauver
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
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={14} /> Modifier
                        </button>
                    )}
                  </td>
                </tr>
                
                {/* Variantes */}
                {expandedProducts.has(produit.id) && produit.variantes && produit.variantes.map((variante) => (
                  <tr key={`${produit.id}-${variante.id}`} style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 24px', paddingLeft: '60px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '3px', height: '16px', backgroundColor: '#d1d5db', borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {[variante.couleur, variante.taille, variante.modele, variante.capacite, variante.puissance].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 24px', fontSize: '13px', color: '#6b7280' }}>
                      {(produit.prix + variante.prixAjustement).toLocaleString()} FCFA
                      {variante.prixAjustement !== 0 && (
                        <span style={{ marginLeft: '4px', fontSize: '11px', color: variante.prixAjustement > 0 ? '#059669' : '#dc2626' }}>
                          ({variante.prixAjustement > 0 ? '+' : ''}{variante.prixAjustement.toLocaleString()})
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      {editingVariante?.produitId === produit.id && editingVariante?.varianteId === variante.id ? (
                        <input
                          type="number"
                          value={editVarianteStock}
                          onChange={(e) => setEditVarianteStock(Number(e.target.value))}
                          style={{
                            width: '60px',
                            padding: '6px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '12px'
                          }}
                        />
                      ) : (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: variante.stock === 0 ? '#fee2e2' : variante.stock <= 3 ? '#fef3c7' : '#dcfce7',
                          color: variante.stock === 0 ? '#dc2626' : variante.stock <= 3 ? '#d97706' : '#16a34a'
                        }}>
                          {variante.stock} unités
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>-</span>
                    </td>
                    <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>0</span>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      {editingVariante?.produitId === produit.id && editingVariante?.varianteId === variante.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleSaveVarianteStock(produit.id, variante.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
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
                              borderRadius: '6px',
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
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Edit2 size={10} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredProduits.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#6b7280' }}>
            <Package size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', fontWeight: '500' }}>Aucun produit trouvé</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Essayez de changer les filtres</p>
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
