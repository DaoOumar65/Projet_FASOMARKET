import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ShoppingCart, Store, AlertCircle } from 'lucide-react';
import { publicService } from '../services/api';

// Composant carrousel d'images
const ImageCarousel = ({ images, productName }: { images: string[], productName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Utiliser les vraies images du backend en priorité, sinon l'image mappée
  const allImages = (() => {
    const imageData = images || productName;
    console.log('Raw image data:', imageData);
    console.log('Type:', typeof imageData);
    
    if (!imageData) return [getProductImage(productName)];
    
    // Si c'est une string avec des virgules, la séparer
    if (typeof imageData === 'string') {
      if (imageData.includes(',')) {
        const splitImages = imageData.split(',').map(img => img.trim()).filter(img => img);
        console.log('Split images:', splitImages);
        return splitImages.length > 0 ? splitImages : [getProductImage(productName)];
      }
      return imageData.trim() ? [imageData] : [getProductImage(productName)];
    }
    
    // Si c'est un array
    if (Array.isArray(imageData)) {
      const validImages = imageData.filter(img => img && img.trim() !== '');
      return validImages.length > 0 ? validImages : [getProductImage(productName)];
    }
    
    return [getProductImage(productName)];
  })();
  
  useEffect(() => {
    if (allImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [allImages.length]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img 
        src={allImages[currentIndex]} 
        alt={productName} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease' }}
        onError={(e) => {
          console.log('Image failed to load:', e.currentTarget.src);
          e.currentTarget.src = getProductImage(productName);
        }}
      />
      {allImages.length > 1 && (
        <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
          {allImages.map((_, index) => (
            <div
              key={index}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mapping des images produits - fallback seulement
const getProductImage = (productName: string): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSIxNzAiIGN5PSIxNzAiIHI9IjEwIiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0xODAgMjIwTDIyMCAyMDBMMjMwIDIzMEwxOTAgMjUwTDE4MCAyMjBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo=';
};

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
  images?: string[];
  image?: string;
  categorie: { nom: string };
  boutique?: { nom: string };
  stock: number;
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
      console.log('Fetching products...');
      setError(null);
      const response = await publicService.getProduits();
      console.log('API Response:', response);
      console.log('Products data:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('First product:', response.data[0]);
        console.log('First product images:', response.data[0].images);
        console.log('Images type:', typeof response.data[0].images);
        console.log('Is array:', Array.isArray(response.data[0].images));
      }
      setProduits(response.data || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      console.error('Error response:', error.response);
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
                  <ImageCarousel images={produit.images || produit.imagesProduit || []} productName={produit.nom} />
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

                  {/* Détails produit */}
                  {produit.details && (produit.details.taille?.length || produit.details.couleur?.length || produit.details.marque) && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                      {produit.details.marque && (
                        <span style={{ padding: '3px 6px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '4px', fontWeight: '500' }}>
                          🏷️ {produit.details.marque}
                        </span>
                      )}
                      {produit.details.taille && produit.details.taille.length > 0 && (
                        <span style={{ padding: '3px 6px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '4px' }}>
                          📏 {produit.details.taille.slice(0, 2).join(', ')}{produit.details.taille.length > 2 ? '...' : ''}
                        </span>
                      )}
                      {produit.details.couleur && produit.details.couleur.length > 0 && (
                        <span style={{ padding: '3px 6px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '4px' }}>
                          🎨 {produit.details.couleur.slice(0, 2).join(', ')}{produit.details.couleur.length > 2 ? '...' : ''}
                        </span>
                      )}
                    </div>
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
