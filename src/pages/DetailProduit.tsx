import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Store, Truck, Shield, ArrowLeft, Plus, Minus, Star } from 'lucide-react';
import { publicService } from '../services/api';
import { usePanier } from '../hooks/usePanier';
import { useAuthStore } from '../store';
import ProductVariants from '../components/ProductVariants';
import toast from 'react-hot-toast';

interface ProduitVariante {
  id: string;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  sku: string;
}

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
  // Détails du produit
  details?: {
    taille?: string[];
    couleur?: string[];
    matiere?: string;
    marque?: string;
    poids?: string;
    dimensions?: string;
    garantie?: string;
    origine?: string;
    [key: string]: any; // Pour d'autres attributs dynamiques
  };
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
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [selectedVariante, setSelectedVariante] = useState<ProduitVariante | null>(null);
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
      console.log('Réponse API complète:', response);
      console.log('Données produit brutes:', response.data);
      
      // Charger les variantes
      try {
        const variantesResponse = await publicService.getProduitVariantes(id!);
        console.log('Variantes chargées:', variantesResponse.data);
        setVariantes(variantesResponse.data || []);
      } catch (error) {
        console.log('Pas de variantes pour ce produit ou erreur:', error);
        setVariantes([]);
      }
      
      // Utiliser directement les données de l'API avec mapping minimal
      const produitData = {
        ...response.data,
        images: response.data.images ? [response.data.images] : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
        boutique: {
          id: response.data.boutiqueId,
          nom: response.data.boutiqueNom,
          adresse: 'Adresse non disponible',
          livraison: false,
          fraisLivraison: 0
        }
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
        await ajouterAuPanier(produit.id, quantite, selectedVariante?.id);
        toast.success(`${quantite} ${produit.nom} ajouté${quantite > 1 ? 's' : ''} au panier`);
      } catch (error) {
        toast.error('Erreur lors de l\'ajout au panier');
      }
    }
  };

  const handleVariantChange = (variante: ProduitVariante | null, qty: number) => {
    setSelectedVariante(variante);
    setQuantite(qty);
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
                src={Array.isArray(produit.images) && produit.images.length > 0 ? produit.images[selectedImage] : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'}
                alt={produit.nom || 'Produit'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {Array.isArray(produit.images) && produit.images.length > 1 && (
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
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>{produit.nom || 'Produit'}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>(4.5)</span>
              </div>
              <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#2563eb' }}>
                {selectedVariante ? selectedVariante.prixAjustement.toLocaleString() : (produit.prix || 0).toLocaleString()} FCFA
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '24px' }}>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>{produit.description || 'Aucune description disponible'}</p>
            </div>

            {/* Variantes */}
            {variantes && variantes.length > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Options disponibles</h3>
                <ProductVariants 
                  produitId={produit.id}
                  variantes={variantes}
                  onVariantChange={handleVariantChange}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ color: '#6b7280', margin: 0 }}>Aucune variante disponible pour ce produit</p>
                  {user?.role === 'VENDEUR' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/vendeur/produits/${produit.id}/variantes`)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Gérer variantes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutique */}
            {produit.boutique && (
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
            )}

            {/* Livraison */}
            {produit.boutique?.livraison && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '12px', marginBottom: '24px' }}>
                <Truck size={24} color="#10b981" />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>Livraison disponible</p>
                  <p style={{ fontSize: '13px', color: '#047857' }}>Frais: {(produit.boutique.fraisLivraison || 0).toLocaleString()} FCFA</p>
                </div>
              </div>
            )}

            {/* Stock */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                Stock: <span style={{ fontWeight: '600', color: (selectedVariante ? selectedVariante.stock : (produit.quantiteStock || produit.stock || 0)) > 10 ? '#10b981' : '#ef4444' }}>
                  {selectedVariante ? selectedVariante.stock : (produit.quantiteStock || produit.stock || 0)} disponible{(selectedVariante ? selectedVariante.stock : (produit.quantiteStock || produit.stock || 0)) > 1 ? 's' : ''}
                </span>
              </p>
            </div>

            {/* Quantité - seulement si pas de variantes */}
            {variantes.length === 0 && (
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
                    onClick={() => setQuantite(Math.min((produit.quantiteStock || produit.stock || 0), quantite + 1))}
                    disabled={quantite >= (produit.quantiteStock || produit.stock || 0)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      cursor: quantite >= (produit.quantiteStock || produit.stock || 0) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddToCart}
                disabled={!produit.disponible || (variantes.length > 0 && !selectedVariante) || (selectedVariante && selectedVariante.stock === 0)}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: (produit.disponible && (variantes.length === 0 || selectedVariante) && (!selectedVariante || selectedVariante.stock > 0)) ? '#2563eb' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (produit.disponible && (variantes.length === 0 || selectedVariante) && (!selectedVariante || selectedVariante.stock > 0)) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShoppingCart size={20} />
                {!produit.disponible ? 'Indisponible' : 
                 variantes.length > 0 && !selectedVariante ? 'Sélectionnez une variante' :
                 selectedVariante && selectedVariante.stock === 0 ? 'Stock épuisé' :
                 'Ajouter au panier'}
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
