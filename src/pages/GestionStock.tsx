import { useEffect, useState } from 'react';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Produit {
  id: string;
  nom: string;
  stock: number;
  prix: number;
  images?: string[] | null;
  nombreVentes: number;
}

export default function GestionStock() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/vendeur/produits', {
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Données brutes du backend:', data);
        // Convertir quantiteStock -> stock et parser images
        const produitsConverted = data.map((p: any) => {
          // Gérer les images
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
            nombreVentes: Number(p.nombreVentes) || 0
          };
        });
        console.log('Produits convertis:', produitsConverted);
        setProduits(produitsConverted);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateStock = async (produitId: string, newStock: number) => {
    try {
      const userId = localStorage.getItem('userId');
      console.log('Mise à jour stock:', { produitId, newStock });
      
      const response = await fetch(`http://localhost:8081/api/produits/${produitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify({ quantiteStock: newStock })
      });
      
      console.log('Réponse:', response.status);
      
      if (response.ok) {
        toast.success('Stock mis à jour avec succès');
        fetchProduits();
      } else {
        const error = await response.text();
        console.error('Erreur backend:', error);
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const filteredProduits = produits.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock <= 5;
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const stats = {
    total: produits.length,
    low: produits.filter(p => p.stock > 0 && p.stock <= 5).length,
    out: produits.filter(p => p.stock === 0).length
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>📦 Gestion du Stock</h1>
        <p style={{ color: '#6b7280' }}>Suivez et gérez vos stocks en temps réel</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total produits</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.total}</p>
            </div>
            <Package size={48} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Stock faible</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.low}</p>
            </div>
            <AlertTriangle size={48} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Rupture de stock</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.out}</p>
            </div>
            <AlertTriangle size={48} style={{ opacity: 0.8 }} />
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

      <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Produit</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prix</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock actuel</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ventes</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modifier stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((produit, index) => (
              <tr key={produit.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={(produit.images && produit.images[0]) || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'}
                      alt={produit.nom}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e5e7eb' }}
                    />
                    <span style={{ fontWeight: '600', color: '#111827' }}>{produit.nom}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: '600', color: '#2563eb' }}>{produit.prix.toLocaleString()} FCFA</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: produit.stock === 0 ? '#fee2e2' : produit.stock <= 5 ? '#fef3c7' : '#dcfce7',
                    color: produit.stock === 0 ? '#dc2626' : produit.stock <= 5 ? '#d97706' : '#16a34a'
                  }}>
                    {produit.stock} unités
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} style={{ color: '#16a34a' }} />
                    <span style={{ fontWeight: '500', color: '#111827' }}>{produit.nombreVentes || 0}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      defaultValue={produit.stock}
                      id={`stock-${produit.id}`}
                      style={{
                        width: '80px',
                        padding: '8px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          updateStock(produit.id, Number(input.value));
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`stock-${produit.id}`) as HTMLInputElement;
                        if (input) {
                          updateStock(produit.id, Number(input.value));
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                    >
                      ✔️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProduits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#6b7280' }}>
            <Package size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', fontWeight: '500' }}>Aucun produit trouvé</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Essayez de changer les filtres</p>
          </div>
        )}
      </div>
    </div>
  );
}
