import { useState, useEffect } from 'react';
import { Package, TrendingDown, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

interface Produit {
  id: string;
  nom: string;
  prix: number;
  quantiteStock: number;
  seuilAlerte: number;
  images: string[];
  disponible: boolean;
}

export default function VendeurGestionStock() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editSeuil, setEditSeuil] = useState<number>(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Utiliser le nouvel endpoint dédié gestion-stock
      const res = await vendorService.getGestionStock();
      console.log('Gestion stock data:', res.data);
      
      // Les données sont déjà formatées par le backend avec les alias français
      const produitsData = res.data.produits || res.data || [];
      setProduits(Array.isArray(produitsData) ? produitsData : []);
      
    } catch (error) {
      console.error('Erreur chargement:', error);
      
      // Fallback vers l'ancien endpoint si le nouveau n'est pas disponible
      try {
        const res = await vendorService.getProduits();
        const produitsData = Array.isArray(res.data) ? res.data.map((produit: any) => ({
          id: produit.id || '',
          nom: produit.nom || produit.name || 'Produit sans nom',
          prix: produit.prix || produit.price || 0,
          quantiteStock: produit.quantiteStock || produit.stock || produit.stockQuantity || 0,
          seuilAlerte: produit.seuilAlerte || produit.alertThreshold || 5,
          images: produit.images ? 
            (typeof produit.images === 'string' ? produit.images.split(',') : produit.images) : 
            ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
          disponible: produit.disponible !== undefined ? produit.disponible : true
        })) : [];
        
        setProduits(produitsData);
      } catch (fallbackError) {
        // Données de test en dernier recours
        setProduits([
          {
            id: '1',
            nom: 'Chemise Traditionnelle',
            prix: 15000,
            quantiteStock: 10,
            seuilAlerte: 5,
            images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
            disponible: true
          },
          {
            id: '2',
            nom: 'Pantalon Bogolan',
            prix: 25000,
            quantiteStock: 2,
            seuilAlerte: 5,
            images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
            disponible: true
          },
          {
            id: '3',
            nom: 'Boubou Élégant',
            prix: 45000,
            quantiteStock: 0,
            seuilAlerte: 3,
            images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
            disponible: false
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
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Gestion Stock</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>Gérez vos stocks de produits</p>

      {/* Alertes Stock */}
      {(produitsEnRupture.length > 0 || produitsAlerte.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {produitsEnRupture.length > 0 && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <AlertTriangle size={20} color="#dc2626" />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>Rupture de stock</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#7f1d1d' }}>{produitsEnRupture.length} produit(s) en rupture</p>
            </div>
          )}
          
          {produitsAlerte.length > 0 && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <TrendingDown size={20} color="#d97706" />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#d97706' }}>Stock faible</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#92400e' }}>{produitsAlerte.length} produit(s) sous le seuil</p>
            </div>
          )}
        </div>
      )}

      {/* Liste des produits */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Package size={24} color="#2563eb" />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Stock des produits</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Produit</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Prix</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Stock</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Seuil alerte</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit) => (
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
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{produit.nom}</span>
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
                        {produit.quantiteStock}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {editingId === produit.id ? (
                      <input
                        type="number"
                        value={editSeuil}
                        onChange={(e) => setEditSeuil(Number(e.target.value))}
                        style={{
                          width: '80px',
                          padding: '6px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {produit.seuilAlerte || 5}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: produit.quantiteStock === 0 ? '#fee2e2' : produit.quantiteStock <= (produit.seuilAlerte || 5) ? '#fef3c7' : '#dcfce7',
                      color: produit.quantiteStock === 0 ? '#dc2626' : produit.quantiteStock <= (produit.seuilAlerte || 5) ? '#d97706' : '#16a34a'
                    }}>
                      {produit.quantiteStock === 0 ? 'Rupture' : produit.quantiteStock <= (produit.seuilAlerte || 5) ? 'Faible' : 'Disponible'}
                    </span>
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
