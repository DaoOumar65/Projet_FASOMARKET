import { useState } from 'react';
import { ShoppingCart, Settings } from 'lucide-react';
import ProductOptions from './ProductOptions';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  colors?: string;
  sizes?: string;
  marque?: string;
  quantiteStock: number;
}

interface AddToCartButtonProps {
  product: Product;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const hasOptions = product.colors || product.sizes || product.marque;

  const handleAddToCart = async () => {
    if (product.colors && !selectedOptions.couleur) {
      toast.error('Veuillez sélectionner une couleur');
      return;
    }
    if (product.sizes && !selectedOptions.taille) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8081/api/client/panier/ajouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId') || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          produitId: product.id,
          quantite: quantity,
          couleurSelectionnee: selectedOptions.couleur,
          tailleSelectionnee: selectedOptions.taille,
          modeleSelectionne: selectedOptions.modele
        })
      });

      if (response.ok) {
        toast.success('Produit ajouté au panier !');
        setShowOptions(false);
      } else {
        toast.error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#374151', 
          marginBottom: '8px' 
        }}>
          Quantité
        </label>
        <input
          type="number"
          min="1"
          max={product.quantiteStock}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          style={{
            width: '80px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Bouton options */}
      {hasOptions && (
        <button 
          onClick={() => setShowOptions(!showOptions)}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Settings size={16} />
          {showOptions ? 'Masquer options' : 'Choisir options'}
        </button>
      )}

      {/* Options */}
      {showOptions && (
        <ProductOptions 
          product={product}
          onOptionsChange={setSelectedOptions}
        />
      )}

      {/* Bouton ajout panier */}
      <button
        onClick={handleAddToCart}
        disabled={loading || product.quantiteStock === 0}
        style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: product.quantiteStock === 0 ? '#9ca3af' : loading ? '#9ca3af' : '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: loading || product.quantiteStock === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
      >
        <ShoppingCart size={20} />
        {loading ? 'Ajout...' : 
         product.quantiteStock === 0 ? 'Rupture de stock' : 
         'Ajouter au panier'}
      </button>
    </div>
  );
};

export default AddToCartButton;