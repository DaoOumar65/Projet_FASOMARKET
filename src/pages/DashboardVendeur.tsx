import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import StockAlert from '../components/StockAlert';
import BoutiqueAvatar from '../components/BoutiqueAvatar';
import GuideVendeur from '../components/GuideVendeur';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

interface Stats {
  produitsTotal: number;
  commandesTotal: number;
  ventesTotal: number;
  revenusTotal: number;
}

export default function DashboardVendeur() {
  const [stats, setStats] = useState<Stats>({ produitsTotal: 0, commandesTotal: 0, ventesTotal: 0, revenusTotal: 0 });
  const [produits, setProduits] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [boutique, setBoutique] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les données avec les services API
        const [produitsRes, boutiqueRes] = await Promise.allSettled([
          vendorService.getProduits(),
          vendorService.getBoutique()
        ]);

        // Traiter la boutique
        if (boutiqueRes.status === 'fulfilled') {
          setBoutique(boutiqueRes.value.data.boutique || boutiqueRes.value.data);
        } else {
          console.warn('Erreur boutique:', boutiqueRes.reason);
        }

        // Traiter les produits
        if (produitsRes.status === 'fulfilled') {
          const produitsData = produitsRes.value.data;
          const produitsConverted = (Array.isArray(produitsData) ? produitsData : []).map((p: any) => {
            // Gérer les images
            let images = [];
            if (p.images) {
              if (typeof p.images === 'string') {
                images = p.images.split(',').map((img: string) => img.trim()).filter(Boolean);
              } else if (Array.isArray(p.images)) {
                images = p.images.filter(Boolean);
              }
            }
            
            return {
              ...p,
              images,
              stock: Number(p.quantiteStock || p.stock) || 0
            };
          });
          setProduits(produitsConverted.slice(0, 5));
          setStats(prev => ({ ...prev, produitsTotal: produitsConverted.length }));
          setLowStockProducts(produitsConverted.filter(p => p.stock <= 5));
        } else {
          console.warn('Erreur produits:', produitsRes.reason);
          // Utiliser des données de test
          setProduits([]);
          setStats(prev => ({ ...prev, produitsTotal: 0 }));
        }

        // Pour les commandes, utiliser des données de test pour l'instant
        setCommandes([]);
        setStats(prev => ({
          ...prev,
          commandesTotal: 0,
          revenusTotal: 0,
          ventesTotal: 0
        }));
      } catch (error) {
        console.error('Erreur générale:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Guide vendeur si pas de boutique */}
      {!boutique && (
        <GuideVendeur statutCompte="VALIDATED" boutique={boutique} />
      )}

      {/* En-tête avec info boutique */}
      {boutique && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BoutiqueAvatar image={boutique.logoUrl} nom={boutique.nom} size={48} />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{boutique.nom}</h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>{boutique.adresse}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <Package size={24} style={{ color: '#2563eb' }} />
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Produits</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.produitsTotal}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
              <ShoppingCart size={24} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Commandes</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.commandesTotal}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>📊</span>
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Ventes</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.ventesTotal}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#e9d5ff', borderRadius: '8px' }}>
              <span style={{ fontSize: '24px' }}>💰</span>
            </div>
            <div style={{ marginLeft: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Revenus</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{stats.revenusTotal.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes Stock */}
      {lowStockProducts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={24} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Alertes Stock ({lowStockProducts.length})
            </h3>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
            {lowStockProducts.map(product => (
              <StockAlert 
                key={product.id} 
                product={{
                  id: product.id,
                  nom: product.nom,
                  quantiteStock: product.stock
                }} 
                onRestock={() => window.location.reload()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>🔥 Actions rapides</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Link to="/vendeur/ajouter-produit" style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
            ➕ Ajouter produit
          </Link>
          <Link to="/vendeur/commandes" style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
            📋 Voir commandes
          </Link>
          <Link to="/vendeur/analytics" style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
            📊 Statistiques
          </Link>
          <Link to="/vendeur/produits" style={{ padding: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
            📦 Mes produits
          </Link>
        </div>
      </div>

      {/* Produits et Commandes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Produits récents */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📦 Produits récents</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {produits.length > 0 ? (
              produits.map((prod) => (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px' }}>
                  <img src={(prod.images && prod.images[0]) || '/placeholder.png'} alt={prod.nom} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500' }}>{prod.nom}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Stock: {prod.stock}</p>
                  </div>
                  <p style={{ fontWeight: 'bold' }}>{(prod.prix || 0).toLocaleString()} FCFA</p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>Aucun produit</p>
            )}
          </div>
        </div>

        {/* Commandes récentes */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📋 Commandes récentes</h3>
          </div>
          <div style={{ padding: '24px' }}>
            {commandes.length > 0 ? (
              commandes.map((cmd) => (
                <div key={cmd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: '500' }}>{cmd.numero || 'N/A'}</span>
                    <span style={{ marginLeft: '16px', color: '#6b7280' }}>
                      {(() => {
                        const total = cmd.total || cmd.montant || cmd.montantTotal || cmd.totalAmount || 0;
                        if (total > 0) {
                          return total.toLocaleString();
                        }
                        // Calculer le total à partir des items si disponible
                        const calculatedTotal = cmd.items?.reduce((sum: number, item: any) => {
                          const prix = item.produit?.prix || item.prix || 0;
                          const quantite = item.quantite || item.quantity || 1;
                          return sum + (prix * quantite);
                        }, 0) || 0;
                        return calculatedTotal.toLocaleString();
                      })()} FCFA
                    </span>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', backgroundColor: '#fef3c7', color: '#92400e' }}>
                    {cmd.statut || 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>Aucune commande</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
