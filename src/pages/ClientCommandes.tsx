import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { clientService } from '../services/api';
import { STATUS_LABELS, STATUS_COLORS, STATUS_FILTERS } from '../constants/orderStatus';
import toast from 'react-hot-toast';

interface Commande {
  id: string;
  numero: string;
  statut: string;
  total: number;
  dateCreation: string;
  items: any[];
  boutique?: any;
}

export default function ClientCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUS');

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      const response = await clientService.getHistoriqueCommandes();
      console.log('Commandes reçues:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('Première commande:', response.data[0]);
        console.log('Champs disponibles:', Object.keys(response.data[0]));
      }
      setCommandes(response.data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement des commandes');
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return <Clock size={20} color="#f59e0b" />;
      case 'EN_PREPARATION': return <Package size={20} color="#3b82f6" />;
      case 'PRETE': return <CheckCircle size={20} color="#10b981" />;
      case 'EN_LIVRAISON': return <Truck size={20} color="#8b5cf6" />;
      case 'LIVREE': return <CheckCircle size={20} color="#10b981" />;
      case 'ANNULEE': return <XCircle size={20} color="#ef4444" />;
      default: return <Package size={20} />;
    }
  };

  const getStatutLabel = (statut: string) => STATUS_LABELS[statut] || statut;
  const getStatutColor = (statut: string) => STATUS_COLORS[statut] || '#f3f4f6';

  const filteredCommandes = filter === 'TOUS' 
    ? commandes 
    : commandes.filter(c => c.statut === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Mes commandes</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>{commandes.length} commande(s) au total</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              backgroundColor: filter === f ? '#2563eb' : 'white',
              color: filter === f ? 'white' : '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {f === 'TOUS' ? 'Toutes' : getStatutLabel(f)}
          </button>
        ))}
      </div>

      {filteredCommandes.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Package size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Aucune commande</h2>
          <p style={{ color: '#6b7280' }}>Vous n'avez pas encore passé de commande</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredCommandes.map((commande) => (
            <Link
              key={commande.id}
              to={`/client/commandes/${commande.id}`}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                display: 'block',
                transition: 'box-shadow 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {commande.numero || commande.numeroCommande || `CMD-${commande.id}`}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {commande.dateCreation ? new Date(commande.dateCreation).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Date inconnue'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: getStatutColor(commande.statut), borderRadius: '8px' }}>
                  {getStatutIcon(commande.statut || 'EN_ATTENTE')}
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{getStatutLabel(commande.statut || 'EN_ATTENTE')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {commande.items?.slice(0, 3).map((item: any, idx: number) => (
                  <img
                    key={idx}
                    src={item.produit?.images?.[0] || ''}
                    alt=""
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                ))}
                {commande.items?.length > 3 && (
                  <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                    +{commande.items.length - 3}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {(commande.items?.length || commande.produits?.length || commande.nombreArticles || 0)} article(s)
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>
                  {(() => {
                    const total = commande.total || commande.montant || commande.montantTotal || commande.totalAmount || commande.prix || 0;
                    if (total > 0) {
                      return total.toLocaleString();
                    }
                    // Calculer le total à partir des items si disponible
                    const calculatedTotal = commande.items?.reduce((sum: number, item: any) => {
                      const prix = item.produit?.prix || item.prix || 0;
                      const quantite = item.quantite || item.quantity || 1;
                      return sum + (prix * quantite);
                    }, 0) || 0;
                    return calculatedTotal.toLocaleString();
                  })()} FCFA
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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
