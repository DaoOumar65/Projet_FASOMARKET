import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, TrendingUp, Package, Clock, CheckCircle } from 'lucide-react';
import { adminService } from '../services/api';
import { STATUS_LABELS, ORDER_STATUS } from '../constants/orderStatus';
import toast from 'react-hot-toast';
import { formatDateOnly } from '../utils/dateUtils';

interface Commande {
  id: string;
  numero: string;
  total: number;
  statut: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  client: {
    nomComplet: string;
    telephone: string;
  };
  vendeur: {
    nomComplet: string;
    boutique: string;
  };
  dateCommande: string;
  adresseLivraison: string;
}

interface StatistiquesCommandes {
  totalCommandes: number;
  commandesAujourdhui: number;
  chiffreAffairesTotal: number;
  chiffreAffairesMois: number;
  commandesParStatut: {
    PENDING: number;
    PROCESSING: number;
    DELIVERED: number;
    CANCELLED: number;
  };
}

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiquesCommandes | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCommandes();
  }, [statutFilter]);

  const fetchCommandes = async () => {
    try {
      const response = await adminService.getCommandes();
      console.log('Admin orders response:', response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      
      if (data.length > 0) {
        console.log('First order structure:', JSON.stringify(data[0], null, 2));
        console.log('All order keys:', Object.keys(data[0]));
      }
      
      // Map data with proper field names
      const mappedData = data.map((cmd: any) => {
        console.log('Raw order data:', {
          id: cmd.id,
          total: cmd.total,
          montant: cmd.montant,
          montantTotal: cmd.montantTotal,
          client: cmd.client,
          clientNom: cmd.clientNom,
          boutique: cmd.boutique,
          vendeur: cmd.vendeur
        });
        
        const mapped = {
          id: cmd.id,
          numero: cmd.numero || cmd.numeroCommande || `CMD-${cmd.id?.slice(-6)}`,
          total: parseFloat(cmd.total || cmd.montant || cmd.montantTotal || 0),
          statut: cmd.statut || cmd.status || ORDER_STATUS.PENDING,
          client: {
            nomComplet: cmd.client?.nomComplet || cmd.client?.fullName || cmd.clientNom || cmd.nomClient || 'Client inconnu',
            telephone: cmd.client?.telephone || cmd.client?.phone || cmd.clientTelephone || cmd.telephoneClient || 'N/A'
          },
          vendeur: {
            nomComplet: cmd.vendeur?.nomComplet || cmd.vendeur?.fullName || cmd.vendeurNom || cmd.nomVendeur || 'Vendeur inconnu',
            boutique: cmd.boutique?.nom || cmd.boutique?.name || cmd.vendeur?.boutique?.nom || cmd.boutiqueName || cmd.nomBoutique || 'Boutique inconnue'
          },
          dateCommande: cmd.dateCreation || cmd.dateCommande || cmd.createdAt,
          adresseLivraison: cmd.adresseLivraison || cmd.adresse || cmd.deliveryAddress || 'Adresse inconnue'
        };
        
        console.log('Mapped order:', mapped);
        return mapped;
      });
      
      setCommandes(mappedData);
      
      // Calculer les statistiques
      const stats = {
        totalCommandes: mappedData.length,
        commandesAujourdhui: mappedData.filter(c => 
          c.dateCommande && new Date(c.dateCommande).toDateString() === new Date().toDateString()
        ).length,
        chiffreAffairesTotal: mappedData.reduce((sum, c) => sum + (c.total || 0), 0),
        chiffreAffairesMois: mappedData.filter(c => 
          c.dateCommande && new Date(c.dateCommande).getMonth() === new Date().getMonth()
        ).reduce((sum, c) => sum + (c.total || 0), 0),
        commandesParStatut: {
          PENDING: mappedData.filter(c => c.statut === ORDER_STATUS.PENDING).length,
          PROCESSING: mappedData.filter(c => c.statut === ORDER_STATUS.CONFIRMED).length,
          DELIVERED: mappedData.filter(c => c.statut === ORDER_STATUS.DELIVERED).length,
          CANCELLED: mappedData.filter(c => c.statut === ORDER_STATUS.CANCELLED).length
        }
      };
      setStatistiques(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setCommandes([]);
      setStatistiques({
        totalCommandes: 0,
        commandesAujourdhui: 0,
        chiffreAffairesTotal: 0,
        chiffreAffairesMois: 0,
        commandesParStatut: {
          PENDING: 0,
          PROCESSING: 0,
          DELIVERED: 0,
          CANCELLED: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const changerStatutCommande = async (commandeId: string, nouveauStatut: string) => {
    setActionLoading(commandeId);
    try {
      await adminService.updateCommandeStatut(commandeId, nouveauStatut);
      toast.success('Statut de la commande modifié');
      fetchCommandes();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = (commande.numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (commande.client?.nomComplet || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (commande.vendeur?.nomComplet || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = !statutFilter || commande.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const getStatutBadge = (statut: string) => {
    const colors = {
      PENDING: { bg: '#fef3c7', text: '#d97706' },
      PROCESSING: { bg: '#dbeafe', text: '#2563eb' },
      DELIVERED: { bg: '#dcfce7', text: '#16a34a' },
      CANCELLED: { bg: '#fee2e2', text: '#dc2626' }
    };
    const color = colors[statut as keyof typeof colors] || colors.PENDING;
    
    const labels = {
      PENDING: STATUS_LABELS.PENDING,
      PROCESSING: STATUS_LABELS.CONFIRMED,
      DELIVERED: STATUS_LABELS.DELIVERED,
      CANCELLED: STATUS_LABELS.CANCELLED
    };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: color.bg,
        color: color.text
      }}>
        {labels[statut as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Gestion des commandes</h1>
          <p style={{ color: '#6b7280' }}>{filteredCommandes.length} commandes trouvées</p>
        </div>
      </div>

      {/* Statistiques */}
      {statistiques && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px', marginRight: '16px' }}>
                <ShoppingBag size={24} style={{ color: '#2563eb' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Total Commandes</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{statistiques.totalCommandes}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', marginRight: '16px' }}>
                <Clock size={24} style={{ color: '#d97706' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Aujourd'hui</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{statistiques.commandesAujourdhui}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px', marginRight: '16px' }}>
                <TrendingUp size={24} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>CA ce mois</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{statistiques.chiffreAffairesMois.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#e9d5ff', borderRadius: '8px', marginRight: '16px' }}>
                <Package size={24} style={{ color: '#9333ea' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>En attente</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{statistiques.commandesParStatut.PENDING}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Rechercher par numéro, client ou vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="">Tous les statuts</option>
              <option value={ORDER_STATUS.PENDING}>{STATUS_LABELS.PENDING}</option>
              <option value={ORDER_STATUS.CONFIRMED}>{STATUS_LABELS.CONFIRMED}</option>
              <option value={ORDER_STATUS.DELIVERED}>{STATUS_LABELS.DELIVERED}</option>
              <option value={ORDER_STATUS.CANCELLED}>{STATUS_LABELS.CANCELLED}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      {filteredCommandes.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <ShoppingBag size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Aucune commande trouvée</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredCommandes.map((commande) => (
            <div key={commande.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginRight: '12px' }}>#{commande.numero || 'N/A'}</h3>
                    {getStatutBadge(commande.statut)}
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginLeft: 'auto' }}>
                      {(commande.total || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>👤</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{commande.client?.nomComplet || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📞</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{commande.client?.telephone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>🏪</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{commande.vendeur?.boutique || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📍</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{commande.adresseLivraison || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📅</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{formatDateOnly(commande.dateCommande)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                  {commande.statut === 'PENDING' && (
                    <button
                      onClick={() => changerStatutCommande(commande.id, 'PROCESSING')}
                      disabled={actionLoading === commande.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Package size={16} />
                      Traiter
                    </button>
                  )}
                  
                  {commande.statut === 'PROCESSING' && (
                    <button
                      onClick={() => changerStatutCommande(commande.id, 'DELIVERED')}
                      disabled={actionLoading === commande.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle size={16} />
                      Livrer
                    </button>
                  )}
                  
                  {(commande.statut === 'PENDING' || commande.statut === 'PROCESSING') && (
                    <button
                      onClick={() => changerStatutCommande(commande.id, 'CANCELLED')}
                      disabled={actionLoading === commande.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
