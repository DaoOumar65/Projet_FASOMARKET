import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Package, ShoppingCart, Calendar } from 'lucide-react';

interface Analytics {
  ventesParMois: Array<{ mois: string; total: number }>;
  produitsPopulaires: Array<{ nom: string; ventes: number; revenus: number }>;
  statistiques: {
    ventesTotales: number;
    revenuTotal: number;
    commandesTotales: number;
    tauxConversion: number;
  };
}

export default function AnalyticsVendeur() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [periode, setPeriode] = useState<'7j' | '30j' | '90j' | '1an'>('30j');

  useEffect(() => {
    fetchAnalytics();
  }, [periode]);

  const fetchAnalytics = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/vendeur/analytics?periode=${periode}`, {
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        setAnalytics(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!analytics) return <div style={{ textAlign: 'center', padding: '32px' }}>Chargement...</div>;

  const stats = [
    {
      title: 'Ventes totales',
      value: analytics.statistiques?.ventesTotales || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Revenu total',
      value: `${(analytics.statistiques?.revenuTotal || 0).toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Commandes',
      value: analytics.statistiques?.commandesTotales || 0,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Taux de conversion',
      value: `${(analytics.statistiques?.tauxConversion || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>Analytics</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['7j', '30j', '90j', '1an'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: periode === p ? '#2563eb' : 'white',
                color: periode === p ? 'white' : '#6b7280',
                boxShadow: periode === p ? '0 4px 6px rgba(37, 99, 235, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat) => (
          <div key={stat.title} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{stat.title}</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{stat.value}</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: stat.color === 'bg-blue-500' ? '#dbeafe' : stat.color === 'bg-green-500' ? '#dcfce7' : stat.color === 'bg-purple-500' ? '#e9d5ff' : '#fef3c7', borderRadius: '12px' }}>
                <stat.icon size={32} style={{ color: stat.color === 'bg-blue-500' ? '#2563eb' : stat.color === 'bg-green-500' ? '#16a34a' : stat.color === 'bg-purple-500' ? '#9333ea' : '#d97706' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} />
            Ventes par mois
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analytics.ventesParMois?.map((item) => (
              <div key={item.mois} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '80px' }}>{item.mois}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div
                      style={{
                        backgroundColor: '#2563eb',
                        height: '100%',
                        borderRadius: '4px',
                        width: `${(item.total / Math.max(...analytics.ventesParMois.map(v => v.total || 0))) * 100}%`
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827', minWidth: '100px', textAlign: 'right' }}>{((item?.total || 0)).toLocaleString()} FCFA</span>
                </div>
              </div>
            )) || <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>Aucune donnée</p>}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} />
            Produits populaires
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analytics.produitsPopulaires?.map((produit, idx) => (
              <div key={idx} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{produit.nom}</p>
                  <span style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    #{idx + 1}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>{produit.ventes || 0} ventes</span>
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>{(produit.revenus || 0).toLocaleString()} FCFA</span>
                </div>
              </div>
            )) || <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>Aucune donnée</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
