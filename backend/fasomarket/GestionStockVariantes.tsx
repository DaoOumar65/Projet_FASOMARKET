// components/GestionStockVariantes.tsx
import React, { useState, useEffect } from 'react';

interface VarianteStock {
  id: number;
  couleur?: string;
  taille?: string;
  modele?: string;
  capacite?: string;
  stock: number;
  sku: string;
  produitNom: string;
  produitId: string;
}

interface Props {
  vendorUserId: string;
}

export const GestionStockVariantes: React.FC<Props> = ({ vendorUserId }) => {
  const [variantesRupture, setVariantesRupture] = useState<VarianteStock[]>([]);
  const [variantesStockFaible, setVariantesStockFaible] = useState<VarianteStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [seuilStockFaible, setSeuilStockFaible] = useState(5);

  useEffect(() => {
    chargerDonneesStock();
  }, [seuilStockFaible]);

  const chargerDonneesStock = async () => {
    try {
      setLoading(true);
      
      // Charger variantes en rupture
      const ruptureResponse = await fetch('/api/vendeur/stock/variantes/rupture', {
        headers: { 'X-User-Id': vendorUserId }
      });
      const rupture = await ruptureResponse.json();
      setVariantesRupture(rupture);

      // Charger variantes stock faible
      const stockFaibleResponse = await fetch(`/api/vendeur/stock/variantes/stock-faible?seuil=${seuilStockFaible}`, {
        headers: { 'X-User-Id': vendorUserId }
      });
      const stockFaible = await stockFaibleResponse.json();
      setVariantesStockFaible(stockFaible);
      
    } catch (error) {
      console.error('Erreur chargement stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const reapprovisionner = async (varianteId: number, quantite: number) => {
    try {
      const response = await fetch(`/api/vendeur/stock/variante/${varianteId}/reapprovisionner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': vendorUserId
        },
        body: JSON.stringify({ quantite })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Réapprovisionnement effectué !');
        chargerDonneesStock(); // Recharger les données
      } else {
        alert('Erreur: ' + result.message);
      }
    } catch (error) {
      console.error('Erreur réapprovisionnement:', error);
      alert('Erreur lors du réapprovisionnement');
    }
  };

  const getVarianteDescription = (variante: VarianteStock) => {
    const parts = [];
    if (variante.couleur) parts.push(variante.couleur);
    if (variante.taille) parts.push(variante.taille);
    if (variante.modele) parts.push(variante.modele);
    if (variante.capacite) parts.push(variante.capacite);
    return parts.length > 0 ? parts.join(' • ') : 'Variante standard';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Chargement du stock...</span>
      </div>
    );
  }

  return (
    <div className="gestion-stock-variantes">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gestion du Stock par Variantes</h2>
        <p className="text-gray-600">
          Suivez et gérez le stock de chaque variante de vos produits
        </p>
      </div>

      {/* Paramètres */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Seuil stock faible:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={seuilStockFaible}
            onChange={(e) => setSeuilStockFaible(parseInt(e.target.value) || 5)}
            className="w-20 p-2 border rounded"
          />
          <span className="text-sm text-gray-600">unités</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl text-red-500 mr-3">🚫</div>
            <div>
              <div className="text-2xl font-bold text-red-700">{variantesRupture.length}</div>
              <div className="text-sm text-red-600">Variantes en rupture</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl text-orange-500 mr-3">⚠️</div>
            <div>
              <div className="text-2xl font-bold text-orange-700">{variantesStockFaible.length}</div>
              <div className="text-sm text-orange-600">Stock faible</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl text-blue-500 mr-3">📦</div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {variantesRupture.length + variantesStockFaible.length}
              </div>
              <div className="text-sm text-blue-600">Total à traiter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Variantes en rupture */}
      {variantesRupture.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-red-700">
            🚫 Variantes en Rupture de Stock
          </h3>
          <div className="space-y-3">
            {variantesRupture.map((variante) => (
              <VarianteStockCard
                key={variante.id}
                variante={variante}
                type="rupture"
                onReapprovisionner={reapprovisionner}
                getDescription={getVarianteDescription}
              />
            ))}
          </div>
        </div>
      )}

      {/* Variantes stock faible */}
      {variantesStockFaible.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-orange-700">
            ⚠️ Variantes avec Stock Faible
          </h3>
          <div className="space-y-3">
            {variantesStockFaible.map((variante) => (
              <VarianteStockCard
                key={variante.id}
                variante={variante}
                type="faible"
                onReapprovisionner={reapprovisionner}
                getDescription={getVarianteDescription}
              />
            ))}
          </div>
        </div>
      )}

      {/* Aucun problème de stock */}
      {variantesRupture.length === 0 && variantesStockFaible.length === 0 && (
        <div className="text-center py-12 bg-green-50 rounded-lg">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Excellent ! Aucun problème de stock
          </h3>
          <p className="text-green-600">
            Toutes vos variantes ont un stock suffisant
          </p>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher une variante avec son stock
const VarianteStockCard: React.FC<{
  variante: VarianteStock;
  type: 'rupture' | 'faible';
  onReapprovisionner: (varianteId: number, quantite: number) => void;
  getDescription: (variante: VarianteStock) => string;
}> = ({ variante, type, onReapprovisionner, getDescription }) => {
  const [quantiteReappro, setQuantiteReappro] = useState(10);

  const handleReapprovisionner = () => {
    if (quantiteReappro > 0) {
      onReapprovisionner(variante.id, quantiteReappro);
    }
  };

  const bgColor = type === 'rupture' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
  const textColor = type === 'rupture' ? 'text-red-700' : 'text-orange-700';

  return (
    <div className={`border rounded-lg p-4 ${bgColor}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className={`font-medium ${textColor}`}>
            {variante.produitNom}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {getDescription(variante)}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className={`font-medium ${textColor}`}>
              Stock: {variante.stock} unité(s)
            </span>
            <span className="text-gray-500">SKU: {variante.sku}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            value={quantiteReappro}
            onChange={(e) => setQuantiteReappro(parseInt(e.target.value) || 1)}
            className="w-20 p-2 border rounded text-sm"
            placeholder="Qté"
          />
          <button
            onClick={handleReapprovisionner}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Réapprovisionner
          </button>
        </div>
      </div>
    </div>
  );
};