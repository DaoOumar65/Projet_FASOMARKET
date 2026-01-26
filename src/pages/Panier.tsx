import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePanier } from '../hooks/usePanier';

interface PanierItem {
  id: string;
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  imagesProduit: string[];
  couleurSelectionnee?: string;
  tailleSelectionnee?: string;
  disponible: boolean;
}

const Panier: React.FC = () => {
  const { panierItems, total, loading, supprimerDuPanier, viderPanier } = usePanier();
  const items = Array.isArray(panierItems) ? panierItems : [];

  const handleSupprimerItem = async (itemId: string) => {
    try {
      await supprimerDuPanier(itemId);
      toast.success('Article supprimé du panier');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleViderPanier = async () => {
    try {
      await viderPanier();
      toast.success('Panier vidé');
    } catch (error) {
      toast.error('Erreur lors du vidage du panier');
    }
  };

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
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Mon Panier
          </h1>
          <p style={{ color: '#6b7280' }}>
            {Array.isArray(items) ? items.length : 0} article{(Array.isArray(items) ? items.length : 0) > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        {!Array.isArray(items) || items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
            <ShoppingCart size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Votre panier est vide
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Link
              to="/produits"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              Voir les produits
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.isArray(items) ? items.map((item) => (
                <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px' }}>
                  <img
                    src={item.produit?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                    alt={item.produit?.nom || 'Produit'}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {item.produit?.nom || 'Produit'}
                    </h3>
                    
                    {/* Affichage des variantes */}
                    {(item.variante || item.couleurSelectionnee || item.tailleSelectionnee || item.modeleSelectionne) && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        {(item.variante?.couleur || item.couleurSelectionnee) && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {item.variante?.couleur || item.couleurSelectionnee}
                          </span>
                        )}
                        {(item.variante?.taille || item.tailleSelectionnee) && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {item.variante?.taille || item.tailleSelectionnee}
                          </span>
                        )}
                        {(item.variante?.modele || item.modeleSelectionne) && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {item.variante?.modele || item.modeleSelectionne}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Quantité: {item.quantite}</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Prix unitaire: {(item.variante?.prixAjustement || item.produit?.prix || 0).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                          {((item.variante?.prixAjustement || item.produit?.prix || 0) * item.quantite).toLocaleString()} FCFA
                        </span>
                        <button
                          onClick={() => handleSupprimerItem(item.id)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : null}
              
              <button
                onClick={handleViderPanier}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '14px',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                Vider le panier
              </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Résumé de la commande
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Sous-total</span>
                <span style={{ fontWeight: '500' }}>{total.toLocaleString()} FCFA</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '18px', fontWeight: '600' }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb' }}>
                  {total.toLocaleString()} FCFA
                </span>
              </div>
              
              <Link
                to="/commande"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              >
                Passer la commande
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panier;