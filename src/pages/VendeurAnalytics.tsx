import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, Users, Calendar } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

interface Analytics {
  ventesParMois: Array<{
    mois: string;
    ventes: number;
    chiffreAffaires: number;
  }>;
  produitsPopulaires: Array<{
    nom: string;
    quantiteVendue: number;
    chiffreAffaires: number;
  }>;
  statistiquesGenerales: {
    chiffreAffairesTotal: number;
    chiffreAffairesMois: number;
    chiffreAffairesHier: number;
    nombreVentesTotales: number;
    nombreVentesMois: number;
    nombreVentesHier: number;
    nombreProduitsActifs: number;
    tauxConversion: number;
    panierMoyen: number;
  };
  evolutionVentes: {
    pourcentageVentes: number;
    pourcentageCA: number;
    tendanceVentes: 'up' | 'down' | 'stable';
    tendanceCA: 'up' | 'down' | 'stable';
  };
}

export default function VendeurAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('30'); // 7, 30, 90 jours

  useEffect(() => {
    fetchAnalytics();
  }, [periode]);

  const fetchAnalytics = async () => {
    try {
      const response = await vendorService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={16} style={{ color: '#16a34a' }} />;
    if (trend === 'down') return <TrendingDown size={16} style={{ color: '#dc2626' }} />;
    return <span style={{ color: '#6b7280' }}>→</span>;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '#16a34a';
    if (trend === 'down') return '#dc2626';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <BarChart3 size={64} style={{ color: '#6b7280', margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Aucune donnée disponible</h2>
        <p style={{ color: '#6b7280' }}>Les analytics apparaîtront après vos premières ventes.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Analytics</h1>
          <p style={{ color: '#6b7280' }}>Analysez les performances de votre boutique</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: '#6b7280' }} />
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Statistiques principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
              <DollarSign size={24} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getTrendColor(analytics.evolutionVentes.tendanceCA) }}>
              {getTrendIcon(analytics.evolutionVentes.tendanceCA)}
              <span style={{ fontSize: '12px', fontWeight: '500' }}>
                {Math.abs(analytics.evolutionVentes.pourcentageCA)}%
              </span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Chiffre d'affaires</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
              {formatCurrency(analytics.statistiquesGenerales.chiffreAffairesMois)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Ce mois</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <ShoppingBag size={24} style={{ color: '#2563eb' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getTrendColor(analytics.evolutionVentes.tendanceVentes) }}>
              {getTrendIcon(analytics.evolutionVentes.tendanceVentes)}
              <span style={{ fontSize: '12px', fontWeight: '500' }}>
                {Math.abs(analytics.evolutionVentes.pourcentageVentes)}%
              </span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Ventes</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
              {analytics.statistiquesGenerales.nombreVentesMois}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Ce mois</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <Package size={24} style={{ color: '#d97706' }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Panier moyen</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
              {formatCurrency(analytics.statistiquesGenerales.panierMoyen)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Par commande</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ padding: '8px', backgroundColor: '#e9d5ff', borderRadius: '8px' }}>
              <Users size={24} style={{ color: '#9333ea' }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Taux de conversion</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
              {analytics.statistiquesGenerales.tauxConversion.toFixed(1)}%
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Visiteurs → Acheteurs</p>
          </div>
        </div>
      </div>

      {/* Graphiques et tableaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Évolution des ventes */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Évolution des ventes</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {analytics.ventesParMois.slice(-6).map((mois, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{mois.mois}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>{mois.ventes} ventes</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>
                    {formatCurrency(mois.chiffreAffaires)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produits populaires */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Produits les plus vendus</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {analytics.produitsPopulaires.slice(0, 5).map((produit, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>{produit.nom}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>{produit.quantiteVendue} unités vendues</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
                    {formatCurrency(produit.chiffreAffaires)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé des performances */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Résumé des performances</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
              {formatCurrency(analytics.statistiquesGenerales.chiffreAffairesTotal)}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>CA total</p>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
              {analytics.statistiquesGenerales.nombreVentesTotales}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Ventes totales</p>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
              {analytics.statistiquesGenerales.nombreProduitsActifs}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Produits actifs</p>
          </div>
        </div>
      </div>
    </div>
  );
}