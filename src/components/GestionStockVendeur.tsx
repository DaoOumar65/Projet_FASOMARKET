import React, { useState, useEffect } from 'react';
import { getVariantesProduit, modifierVariante, obtenirInfoStock } from '../services/api';

interface Produit {
  id: string;
  nom: string;
  stock: number;
}

interface ProduitVariante {
  id: number;
  produitId: string;
  couleur?: string;
  taille?: string;
  modele?: string;
  prixAjustement: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface GestionStockVendeurProps {
  produit: Produit;
  onStockUpdate?: () => void;
}

interface InfoStock {
  stockGlobal: number;
  stockVariantesTotal: number;
  stockDisponible: number;
}

const Badge: React.FC<{type: string, value: string}> = ({ type, value }) => {
  const colors = {
    couleur: { bg: '#dbeafe', color: '#2563eb' },
    taille: { bg: '#dcfce7', color: '#16a34a' },
    modele: { bg: '#fef3c7', color: '#d97706' },
    stock: { bg: '#ecfdf5', color: '#059669' }
  };
  const style = colors[type as keyof typeof colors] || { bg: '#f3f4f6', color: '#374151' };
  
  return (
    <span style={{
      padding: '4px 8px',
      backgroundColor: style.bg,
      color: style.color,
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500'
    }}>
      {value}
    </span>
  );
};

export const GestionStockVendeur: React.FC<GestionStockVendeurProps> = ({
  produit,
  onStockUpdate
}) => {
  const [variantes, setVariantes] = useState<ProduitVariante[]>([]);
  const [infoStock, setInfoStock] = useState<InfoStock | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingVariante, setEditingVariante] = useState<number | null>(null);
  const [nouveauStock, setNouveauStock] = useState<number>(0);

  useEffect(() => {
    chargerDonnees();
  }, [produit.id]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement données stock pour produit:', produit.id);
      
      const [variantesData, stockInfo] = await Promise.allSettled([
        getVariantesProduit(produit.id),
        obtenirInfoStock(produit.id)
      ]);
      
      // Traiter les variantes
      if (variantesData.status === 'fulfilled') {
        console.log('✅ Variantes chargées:', variantesData.value);
        setVariantes(variantesData.value);
      } else {
        console.error('❌ Erreur variantes:', variantesData.reason);
        setVariantes([]);
      }
      
      // Traiter les infos stock
      if (stockInfo.status === 'fulfilled') {
        console.log('✅ Stock info chargé:', stockInfo.value);
        setInfoStock(stockInfo.value);
      } else {
        console.error('❌ Erreur stock info:', stockInfo.reason);
        setInfoStock({
          stockGlobal: produit.stock || 0,
          stockVariantesTotal: 0,
          stockDisponible: produit.stock || 0
        });
      }
    } catch (error) {
      console.error('❌ Erreur générale chargement données stock:', error);
      setVariantes([]);
      setInfoStock({
        stockGlobal: produit.stock || 0,
        stockVariantesTotal: 0,
        stockDisponible: produit.stock || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const modifierStockVariante = async (varianteId: number, nouveauStock: number) => {
    try {
      await modifierVariante(produit.id, varianteId, { stock: nouveauStock });
      await chargerDonnees();
      onStockUpdate?.();
      setEditingVariante(null);
    } catch (error) {
      console.error('Erreur modification stock:', error);
      alert('Erreur lors de la modification du stock');
    }
  };

  const commencerEdition = (variante: ProduitVariante) => {
    setEditingVariante(variante.id);
    setNouveauStock(variante.stock);
  };

  const annulerEdition = () => {
    setEditingVariante(null);
    setNouveauStock(0);
  };

  const confirmerModification = () => {
    if (editingVariante && nouveauStock >= 0) {
      modifierStockVariante(editingVariante, nouveauStock);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Chargement des stocks...</div>
        <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
          Produit: {produit.id}
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-stock-vendeur">
      <h3>📦 Gestion des Stocks</h3>
      
      {/* Résumé Stock Global */}
      <div className="stock-resume">
        <div className="stock-card">
          <div className="stock-label">Stock Global</div>
          <div className="stock-value global">{produit.stock}</div>
        </div>
        
        {infoStock && (
          <>
            <div className="stock-card">
              <div className="stock-label">Réparti en Variantes</div>
              <div className="stock-value reparti">{infoStock.stockVariantesTotal}</div>
            </div>
            
            <div className="stock-card">
              <div className="stock-label">Stock Disponible</div>
              <div className={`stock-value disponible ${infoStock.stockDisponible < 0 ? 'negatif' : ''}`}>
                {infoStock.stockDisponible}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Alerte si dépassement */}
      {infoStock && infoStock.stockDisponible < 0 && (
        <div className="alert alert-danger">
          ⚠️ Stock des variantes dépasse le stock global de {Math.abs(infoStock.stockDisponible)} unités
        </div>
      )}

      {/* Liste des Variantes */}
      <div className="variantes-stock">
        <h4>Répartition par Variantes</h4>
        
        {variantes.length === 0 ? (
          <div className="no-variants">
            <p>Aucune variante définie</p>
            <p>Stock disponible: <strong>{produit.stock}</strong></p>
          </div>
        ) : (
          <div className="variantes-list">
            {variantes.map((variante) => (
              <div key={variante.id} className="variante-stock-item">
                <div className="variante-info">
                  <div className="variante-details">
                    {variante.couleur && <Badge type="couleur" value={variante.couleur} />}
                    {variante.taille && <Badge type="taille" value={variante.taille} />}
                    {variante.modele && <Badge type="modele" value={variante.modele} />}
                  </div>
                  
                  <div className="stock-controls">
                    {editingVariante === variante.id ? (
                      <div className="stock-edit">
                        <input
                          type="number"
                          min="0"
                          max={infoStock ? produit.stock - infoStock.stockVariantesTotal + variante.stock : produit.stock}
                          value={nouveauStock}
                          onChange={(e) => setNouveauStock(parseInt(e.target.value) || 0)}
                          className="stock-input"
                        />
                        <button onClick={confirmerModification} className="btn-confirm">✓</button>
                        <button onClick={annulerEdition} className="btn-cancel">✗</button>
                      </div>
                    ) : (
                      <div className="stock-display">
                        <span className={`stock-number ${variante.stock === 0 ? 'epuise' : ''}`}>
                          {variante.stock}
                        </span>
                        <button 
                          onClick={() => commencerEdition(variante)}
                          className="btn-edit-stock"
                          title="Modifier le stock"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="variante-status">
                  {variante.stock > 0 ? (
                    <Badge type="stock" value="En stock" />
                  ) : (
                    <Badge type="stock" value="Épuisé" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};