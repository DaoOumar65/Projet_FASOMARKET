import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientService } from '../services/api';

interface AddToCartProps {
  produitId: string;
  stockQuantity: number;
  couleurSelectionnee?: string;
  tailleSelectionnee?: string;
  modeleSelectionne?: string;
  onSuccess?: () => void;
}

const AddToCart: React.FC<AddToCartProps> = ({
  produitId,
  stockQuantity,
  couleurSelectionnee,
  tailleSelectionnee,
  modeleSelectionne,
  onSuccess
}) => {
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantite + delta;
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      setQuantite(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem('userId')) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        produitId,
        quantite
      };

      if (couleurSelectionnee) data.couleurSelectionnee = couleurSelectionnee;
      if (tailleSelectionnee) data.tailleSelectionnee = tailleSelectionnee;
      if (modeleSelectionne) data.modeleSelectionne = modeleSelectionne;

      await clientService.ajouterAuPanier(produitId, quantite);
      toast.success(`${quantite} article(s) ajouté(s) au panier`);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur ajout panier:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter');
      } else {
        toast.error('Erreur lors de l\'ajout au panier');
      }
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = stockQuantity === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
          Quantité:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantite <= 1}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: quantite <= 1 ? 'not-allowed' : 'pointer',
              color: quantite <= 1 ? '#9ca3af' : '#374151'
            }}
          >
            <Minus size={16} />
          </button>
          <span style={{ padding: '8px 16px', fontSize: '16px', fontWeight: '500' }}>
            {quantite}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantite >= stockQuantity}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: quantite >= stockQuantity ? 'not-allowed' : 'pointer',
              color: quantite >= stockQuantity ? '#9ca3af' : '#374151'
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {stockQuantity} disponible(s)
        </span>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading || isOutOfStock}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: isOutOfStock ? '#9ca3af' : loading ? '#6b7280' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: isOutOfStock || loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        <ShoppingCart size={20} />
        {loading ? 'Ajout...' : isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
      </button>
    </div>
  );
};

export default AddToCart;