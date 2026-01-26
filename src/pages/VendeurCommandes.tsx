import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, FileText } from 'lucide-react';
import { vendorService } from '../services/api';
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUS } from '../constants/orderStatus';
import FactureModal from '../components/FactureModal';
import toast from 'react-hot-toast';

// Mapping des images produits
const getProductImage = (productName: string): string => {
  const name = productName?.toLowerCase() || '';
  
  if (name.includes('boubou')) {
    return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop';
  }
  if (name.includes('iphone') || name.includes('phone')) {
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop';
  }
  if (name.includes('chaussette')) {
    return 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=400&fit=crop';
  }
  if (name.includes('pantalon') || name.includes('bogolan')) {
    return 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop';
  }
  if (name.includes('chemise')) {
    return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop';
  }
  // Image par défaut
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
};

interface Commande {
  id: string;
  numero: string;
  statut: string;
  total?: number; // Optional
  dateCreation: string;
  client?: { nomComplet?: string; telephone?: string };
  items: Array<{ quantite: number; produit: { nom: string; images: string[] } }>;
}

const statuts = [
  { value: ORDER_STATUS.PENDING, label: STATUS_LABELS.PENDING, color: 'bg-yellow-100 text-yellow-800' },
  { value: ORDER_STATUS.CONFIRMED, label: STATUS_LABELS.CONFIRMED, color: 'bg-blue-100 text-blue-800' },
  { value: ORDER_STATUS.SHIPPED, label: STATUS_LABELS.SHIPPED, color: 'bg-purple-100 text-purple-800' },
  { value: ORDER_STATUS.DELIVERED, label: STATUS_LABELS.DELIVERED, color: 'bg-green-100 text-green-800' }
];

export default function VendeurCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TOUS');
  const [factureModal, setFactureModal] = useState<{ isOpen: boolean; commandeId: string }>({ isOpen: false, commandeId: '' });

  useEffect(() => {
    console.log('=== useEffect VendeurCommandes déclenché ===');
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    setLoading(true);
    
    try {
      const response = await vendorService.getCommandes();
      const data = Array.isArray(response.data) ? response.data : [];
      
      const commandesMappees = data.map((cmd: any, index: number) => ({
        id: cmd.id || `temp-${index}`,
        numero: cmd.numero || `CMD-${(cmd.id || '').slice(-6)}`,
        statut: cmd.statut || ORDER_STATUS.PENDING,
        total: Number(cmd.total || 0),
        dateCreation: cmd.dateCreation || new Date().toISOString(),
        client: {
          nomComplet: cmd.clientNom || 'Client inconnu',
          telephone: cmd.clientTelephone || 'N/A'
        },
        items: cmd.items || []
      }));
      
      console.log('Statuts des commandes:', commandesMappees.map(c => c.statut));
      console.log('Statuts uniques:', [...new Set(commandesMappees.map(c => c.statut))]);
      setCommandes(commandesMappees);
    } catch (error: any) {
      console.error('Erreur chargement commandes vendeur:', error);
      toast.error('Erreur lors du chargement des commandes');
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (commandeId: string, newStatut: string) => {
    const commande = commandes.find(c => c.id === commandeId);
    console.log('Current status:', commande?.statut, '-> New status:', newStatut);
    
    try {
      await vendorService.updateCommandeStatut(commandeId, newStatut);
      
      // Si la commande passe à CONFIRMEE, décrémenter le stock
      if (newStatut === ORDER_STATUS.CONFIRMED && commande?.statut !== ORDER_STATUS.CONFIRMED) {
        try {
          await vendorService.decrementerStock(commandeId);
          console.log('Stock décrémenté pour la commande:', commandeId);
        } catch (stockError) {
          console.error('Erreur décrémentation stock:', stockError);
          toast.error('Commande confirmée mais erreur mise à jour stock');
        }
      }
      
      toast.success('Statut mis à jour');
      fetchCommandes();
    } catch (error: any) {
      console.error('Status transition error:', error.response?.data);
      toast.error(`Erreur: ${error.response?.data || error.message}`);
    }
  };

  const filteredCommandes = filter === 'TOUS' 
    ? commandes 
    : commandes.filter(c => {
        console.log('Filtrage:', c.statut, 'vs', filter, '=', c.statut === filter);
        return c.statut === filter;
      });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Mes Commandes</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['TOUS', ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].map((f) => (
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
            {f === 'TOUS' ? 'Toutes' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredCommandes.map((commande) => (
          <div key={commande.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{commande.numero}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{new Date(commande.dateCreation).toLocaleString('fr-FR')}</p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                  <strong>Client:</strong> {commande.client?.nomComplet || 'Client inconnu'} - {commande.client?.telephone || 'N/A'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', backgroundColor: statuts.find(s => s.value === commande.statut)?.value === 'LIVREE' ? '#dcfce7' : '#dbeafe', color: statuts.find(s => s.value === commande.statut)?.value === 'LIVREE' ? '#16a34a' : '#2563eb' }}>
                    {statuts.find(s => s.value === commande.statut)?.label}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {commande.items?.reduce((sum, item) => sum + (item.quantite || 1), 0) || 0} article(s)
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                  {(() => {
                    const total = commande.total || 0;
                    if (total > 0) return total.toLocaleString();
                    const calculatedTotal = commande.items?.reduce((sum, item) => {
                      const prix = item.produit?.prix || 0;
                      const quantite = item.quantite || 1;
                      return sum + (prix * quantite);
                    }, 0) || 0;
                    return calculatedTotal.toLocaleString();
                  })()} FCFA
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {commande.items?.slice(0, 4).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: '200px' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.produit?.images?.[0] || getProductImage(item.produit?.nom)}
                      alt={item.produit?.nom || 'Produit'}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #f3f4f6' }}
                      onError={(e) => {
                        e.currentTarget.src = getProductImage(item.produit?.nom);
                      }}
                    />
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.quantite || 1}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#111827', marginBottom: '4px', fontSize: '13px', lineHeight: '1.2' }}>{item.produit?.nom || 'Produit'}</p>
                    <p style={{ color: '#6b7280', fontSize: '11px' }}>{item.quantite || 1} article{(item.quantite || 1) > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
              {(commande.items?.length || 0) > 4 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #d1d5db', minWidth: '80px', minHeight: '80px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#6b7280' }}>+{(commande.items?.length || 0) - 4}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Changer statut:</label>
                <select
                  value={commande.statut}
                  onChange={(e) => updateStatut(commande.id, e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}
                >
                  {statuts.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setFactureModal({ isOpen: true, commandeId: commande.id })}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                <FileText size={16} />
                Générer Facture
              </button>
            </div>
          </div>
        ))}

        {filteredCommandes.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Package size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Aucune commande</h2>
            <p style={{ color: '#6b7280' }}>{filter === 'TOUS' ? 'Aucune commande pour le moment' : `Aucune commande ${STATUS_LABELS[filter]?.toLowerCase()}`}</p>
          </div>
        )}
      </div>
      
      <FactureModal 
        isOpen={factureModal.isOpen}
        onClose={() => setFactureModal({ isOpen: false, commandeId: '' })}
        commandeId={factureModal.commandeId}
      />
    </div>
  );
}
