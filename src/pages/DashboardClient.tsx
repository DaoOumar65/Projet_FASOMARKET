import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Heart, MapPin } from 'lucide-react';
import { ORDER_STATUS, STATUS_LABELS } from '../constants/orderStatus';

interface Stats {
  commandesTotal: number;
  commandesEnCours: number;
  favorisTotal: number;
  panierTotal: number;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats>({ commandesTotal: 0, commandesEnCours: 0, favorisTotal: 0, panierTotal: 0 });
  const [commandes, setCommandes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const [commandesRes, panierRes] = await Promise.all([
          fetch('http://localhost:8081/api/client/historique-commandes', {
            headers: { 'X-User-Id': userId || '' }
          }),
          fetch('http://localhost:8081/api/client/panier', {
            headers: { 'X-User-Id': userId || '' }
          })
        ]);

        if (commandesRes.ok) {
          const commandesData = await commandesRes.json();
          console.log('Dashboard orders data:', commandesData);
          setCommandes(commandesData.slice(0, 5));
          setStats(prev => ({
            ...prev,
            commandesTotal: commandesData.length,
            commandesEnCours: commandesData.filter((c: any) => ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(c.statut)).length
          }));
        }

        if (panierRes.ok) {
          const panierData = await panierRes.json();
          setStats(prev => ({ ...prev, panierTotal: panierData.length }));
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Tableau de bord</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <Link to="/client/commandes" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <Package size={24} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Commandes</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.commandesTotal}</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/client/commandes" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <ShoppingBag size={24} style={{ color: '#d97706' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>En cours</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.commandesEnCours}</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/panier" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <ShoppingBag size={24} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Panier</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.panierTotal}</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/favoris" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                <Heart size={24} style={{ color: '#dc2626' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Favoris</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.favorisTotal}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Commandes récentes</h2>
          <Link to="/client/commandes" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Voir tout</Link>
        </div>
        <div style={{ padding: '24px' }}>
          {commandes.length > 0 ? (
            commandes.map((cmd) => (
              <div key={cmd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{cmd.numero || cmd.numeroCommande || `CMD-${cmd.id}`}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{cmd.dateCreation ? new Date(cmd.dateCreation).toLocaleDateString('fr-FR') : cmd.dateCommande ? new Date(cmd.dateCommande).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{(cmd.total || cmd.montant || cmd.montantTotal || 0).toLocaleString()} FCFA</p>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', backgroundColor: '#dbeafe', color: '#2563eb' }}>
                    {STATUS_LABELS[cmd.statut] || cmd.statut || 'En attente'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>Aucune commande</p>
          )}
        </div>
      </div>
    </div>
  );
}
