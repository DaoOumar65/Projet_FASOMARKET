import React from 'react';
import { usePanier } from '../contexts/PanierContext';

const PanierComponent: React.FC = () => {
  const { panierItems, total, supprimerDuPanier } = usePanier();

  return (
    <div>
      {panierItems.map(item => (
        <div key={item.id}>
          <span>{item.produit.nom}</span>
          <span>Qté: {item.quantite}</span>
          <span>{item.produit.prix * item.quantite} FCFA</span>
          <button onClick={() => supprimerDuPanier(item.id)}>×</button>
        </div>
      ))}
      <div>Total: {total} FCFA</div>
    </div>
  );
};

export default PanierComponent;
