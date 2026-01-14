import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Store, Truck, Shield, ArrowLeft, Plus, Minus, Star } from 'lucide-react';
import { publicService } from '../services/api';
import { usePanier } from '../contexts/PanierContext';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  images: string[]; // Toujours un array après mapping
  boutique: {
    id: string;
    nom: string;
    adresse: string;
    livraison: boolean;
    fraisLivraison: number;
  };
  disponible: boolean;
  quantiteStock: number;
  categorie: string;
  // Champs optionnels pour compatibilité API
  boutiqueId?: string;
  nomBoutique?: string;
  stock?: number;
}

export default function DetailProduit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantite, setQuantite] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { ajouterAuPanier } = usePanier();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchProduit();
    }
  }, [id]);

  const fetchProduit = async () => {
    try {
      const response = await publicService.getProduit(id!);
      console.log('Produit chargé:', response.data);
      
      // Mapper les données avec gestion des images
      const produitData = {
        ...response.data,
        nom: response.data.nom || response.data.name || 'Produit sans nom',
        prix: response.data.prix || response.data.price || 0,
        images: response.data.images ? 
          (typeof response.data.images === 'string' ? 
            response.data.images.split(',').map((img: string) => img.trim()) : 
            response.data.images
          ) : 
          ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
        boutique: {
          id: response.data.boutiqueId || response.data.boutique?.id || '',
          nom: response.data.nomBoutique || response.data.boutique?.nom || 'Boutique inconnue',
          adresse: response.data.boutique?.adresse || 'Adresse non disponible',
          livraison: response.data.boutique?.livraison || false,
          fraisLivraison: response.data.boutique?.fraisLivraison || 0
        },
        quantiteStock: response.data.quantiteStock || response.data.stock || 0,
        disponible: response.data.disponible !== undefined ? response.data.disponible : true
      };
      
      setProduit(produitData);
    } catch (error) {
      console.error('Erreur chargement produit:', error);
      toast.error('Produit introuvable');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier');
      navigate('/connexion');
      return;
    }

    if (user?.role !== 'CLIENT') {
      toast.error('Seuls les clients peuvent acheter');
      return;
    }

    if (produit) {
      try {
        await ajouterAuPanier(produit.id, quantite);
        toast.success(`${quantite} ${produit.nom} ajouté${quantite > 1 ? 's' : ''} au panier`);
      } catch (error) {
        toast.error('Erreur lors de l\'ajout au panier');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!produit) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>Accueil</Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <Link to="/boutiques" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>Boutiques</Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{produit.nom}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#374151',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          {/* Images */}
          <div>
            <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f3f4f6', aspectRatio: '1' }}>
              <img
                src={(produit.images && produit.images.length > 0) ? produit.images[selectedImage] : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'}
                alt={produit.nom}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {produit.images && produit.images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {produit.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === idx ? '2px solid #2563eb' : '2px solid #e5e7eb',
                      opacity: selectedImage === idx ? 1 : 0.6
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '12px', fontWeight: '500', marginBottom: '12px' }}>
                {produit.categorie}
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>{produit.nom}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>(4.5)</span>
              </div>
              <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#2563eb' }}>
                {produit.prix ? produit.prix.toLocaleString() : '0'} FCFA
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>{produit.description}</p>
            </div>

            {/* Boutique */}
            <Link
              to={`/boutiques/${produit.boutique.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                textDecoration: 'none',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
              }}
            >
              <Store size={24} color="#2563eb" />
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Vendu par</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{produit.boutique.nom}</p>
              </div>
            </Link>

            {/* Livraison */}
            {produit.boutique.livraison && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '12px', marginBottom: '24px' }}>
                <Truck size={24} color="#10b981" />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>Livraison disponible</p>
                  <p style={{ fontSize: '13px', color: '#047857' }}>Frais: {produit.boutique.fraisLivraison.toLocaleString()} FCFA</p>
                </div>
              </div>
            )}

            {/* Stock */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Stock: <span style={{ fontWeight: '600', color: produit.quantiteStock > 10 ? '#10b981' : '#ef4444' }}>
                  {produit.quantiteStock} disponible{produit.quantiteStock > 1 ? 's' : ''}
                </span>
              </p>
            </div>

            {/* Quantité */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Quantité
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantite(Math.max(1, quantite - 1))}
                  disabled={quantite <= 1}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: quantite <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{quantite}</span>
                <button
                  onClick={() => setQuantite(Math.min(produit.quantiteStock, quantite + 1))}
                  disabled={quantite >= produit.quantiteStock}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: quantite >= produit.quantiteStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddToCart}
                disabled={!produit.disponible || produit.quantiteStock === 0}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: produit.disponible ? '#2563eb' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: produit.disponible ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShoppingCart size={20} />
                {produit.disponible ? 'Ajouter au panier' : 'Indisponible'}
              </button>
              <button
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart size={24} color="#ef4444" />
              </button>
            </div>

            {/* Garanties */}
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={20} color="#10b981" />
                <span style={{ fontSize: '14px', color: '#374151' }}>Paiement sécurisé</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Truck size={20} color="#10b981" />
                <span style={{ fontSize: '14px', color: '#374151' }}>Livraison rapide</span>
              </div>
            </div>
          </div>
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
