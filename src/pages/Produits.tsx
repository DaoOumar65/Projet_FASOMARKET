import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ShoppingCart, Store, AlertCircle } from 'lucide-react';
import { publicService } from '../services/api';

const decodeHTML = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  images: string[];
  categorie: { nom: string };
  boutique?: { nom: string };
  stock: number;
}

export default function Produits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      setError(null);
      const response = await publicService.getProduits();
      setProduits(response.data || []);
    } catch (error: any) {
      console.error('Erreur chargement produits:', error);
      if (error.response?.status === 404) {
        setError('Endpoint /api/public/produits non implémenté');
      } else {
        setError('Erreur lors du chargement des produits');
      }
      setProduits([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = produits.filter(p =>
    p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Nos Produits
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            {produits.length > 0 ? `Découvrez ${produits.length} produit${produits.length > 1 ? 's' : ''} disponible${produits.length > 1 ? 's' : ''}` : 'Explorez notre catalogue'}
          </p>

          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
            <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
            <div>
              <p style={{ color: '#dc2626', fontWeight: '500' }}>Erreur</p>
              <p style={{ color: '#7f1d1d', fontSize: '14px' }}>{error}</p>
            </div>
          </div>
        )}

        {filteredProduits.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredProduits.map((produit) => (
              <Link
                key={produit.id}
                to={`/produits/${produit.id}`}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {produit.images && produit.images.length > 0 ? (
                    <img src={produit.images[0]} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={48} style={{ color: '#9ca3af' }} />
                  )}
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {decodeHTML(produit.nom)}
                  </h3>

                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    {decodeHTML(produit.description)}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                      {produit.prix.toLocaleString()} FCFA
                    </span>
                    {produit.stock !== undefined && (
                      <span style={{ fontSize: '12px', color: produit.stock > 0 ? '#059669' : '#dc2626', fontWeight: '500' }}>
                        {produit.stock > 0 ? `${produit.stock} en stock` : 'Rupture'}
                      </span>
                    )}
                  </div>

                  {produit.categorie && (
                    <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                      {produit.categorie.nom}
                    </span>
                  )}

                  {produit.boutique && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                      <Store size={14} />
                      <span>{produit.boutique.nom}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px', backgroundColor: 'white', borderRadius: '16px' }}>
            <Package size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
            </h3>
            <p style={{ color: '#6b7280' }}>
              {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Les produits apparaîtront ici une fois ajoutés'}
            </p>
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
