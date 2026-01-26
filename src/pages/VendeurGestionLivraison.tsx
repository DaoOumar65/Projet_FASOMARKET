import { useState, useEffect } from 'react';
import { Truck, Edit2, Save, X, Package, CheckCircle, MapPin, Clock, User, Phone } from 'lucide-react';
import { vendorService } from '../services/api';
import { STATUS_LABELS, ORDER_STATUS } from '../constants/orderStatus';
import toast from 'react-hot-toast';

interface ParametresLivraison {
  livraisonActive: boolean;
  fraisLivraison: number;
  zonesLivraison: string[];
  delaiLivraison: string;
}

export default function VendeurGestionLivraison() {
  const [loading, setLoading] = useState(true);
  const [livraison, setLivraison] = useState<ParametresLivraison>({
    livraisonActive: false,
    fraisLivraison: 0,
    zonesLivraison: [],
    delaiLivraison: '24-48h'
  });
  const [editing, setEditing] = useState(false);
  const [commandesLivrees, setCommandesLivrees] = useState<any[]>([]);
  const [commandesEnLivraison, setCommandesEnLivraison] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('parametres');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boutiqueRes, commandesRes] = await Promise.all([
        vendorService.getBoutique(),
        vendorService.getCommandes()
      ]);
      
      if (boutiqueRes.data) {
        setLivraison({
          livraisonActive: boutiqueRes.data.livraison || false,
          fraisLivraison: boutiqueRes.data.fraisLivraison || 0,
          zonesLivraison: boutiqueRes.data.zonesLivraison || [],
          delaiLivraison: boutiqueRes.data.delaiLivraison || '24-48h'
        });
      }
      
      if (commandesRes.data) {
        const livrees = commandesRes.data.filter((cmd: any) => cmd.statut === ORDER_STATUS.DELIVERED);
        const enLivraison = commandesRes.data.filter((cmd: any) => cmd.statut === ORDER_STATUS.SHIPPED);
        setCommandesLivrees(livrees);
        setCommandesEnLivraison(enLivraison);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await vendorService.updateLivraison(livraison);
      setEditing(false);
      toast.success('Paramètres de livraison mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const marquerLivree = async (commandeId: string) => {
    try {
      await vendorService.updateCommandeStatut(commandeId, ORDER_STATUS.DELIVERED);
      toast.success('Commande marquée comme livrée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStats = () => {
    const totalLivraisons = commandesLivrees.length + commandesEnLivraison.length;
    const tauxLivraison = totalLivraisons > 0 ? Math.round((commandesLivrees.length / totalLivraisons) * 100) : 0;
    const chiffreAffaire = commandesLivrees.reduce((sum, cmd) => sum + (cmd.total || 0), 0);
    
    return { totalLivraisons, tauxLivraison, chiffreAffaire };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Centre de Livraison</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>Gestion complète de vos livraisons et paramètres</p>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={24} color="#2563eb" />
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>En livraison</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{commandesEnLivraison.length}</p>
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Livrées</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{commandesLivrees.length}</p>
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={24} color="#f59e0b" />
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Taux de livraison</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.tauxLivraison}%</p>
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={24} color="#8b5cf6" />
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>CA Livraisons</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{stats.chiffreAffaire.toLocaleString()} F</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
        {[
          { id: 'parametres', label: 'Paramètres', icon: Edit2 },
          { id: 'en-cours', label: 'En livraison', icon: Truck, count: commandesEnLivraison.length },
          { id: 'livrees', label: 'Livrées', icon: CheckCircle, count: commandesLivrees.length }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#111827' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{ padding: '2px 8px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', fontSize: '12px' }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'parametres' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Edit2 size={24} color="#2563eb" />
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Paramètres de livraison</h2>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit2 size={16} />
                Modifier
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={16} />
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Activation de la livraison</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={livraison.livraisonActive}
                  onChange={(e) => setLivraison({ ...livraison, livraisonActive: e.target.checked })}
                  disabled={!editing}
                  style={{ width: '20px', height: '20px', accentColor: '#2563eb' }}
                />
                <span>Proposer la livraison à mes clients</span>
              </label>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Activez cette option pour permettre la livraison de vos produits</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Tarification</h3>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Frais de livraison
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={livraison.fraisLivraison}
                  onChange={(e) => setLivraison({ ...livraison, fraisLivraison: Number(e.target.value) })}
                  disabled={!editing || !livraison.livraisonActive}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '12px 50px 12px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: !livraison.livraisonActive ? '#f9fafb' : 'white'
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6b7280' }}>FCFA</span>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Montant facturé pour la livraison (0 = gratuite)</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Délais de livraison</h3>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Temps de livraison estimé
              </label>
              <select
                value={livraison.delaiLivraison}
                onChange={(e) => setLivraison({ ...livraison, delaiLivraison: e.target.value })}
                disabled={!editing || !livraison.livraisonActive}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: !livraison.livraisonActive ? '#f9fafb' : 'white'
                }}
              >
                <option value="2-4h">2-4 heures (livraison express)</option>
                <option value="24h">24 heures (livraison rapide)</option>
                <option value="24-48h">1-2 jours ouvrables</option>
                <option value="48-72h">2-3 jours ouvrables</option>
                <option value="3-5j">3-5 jours ouvrables</option>
                <option value="5-7j">5-7 jours ouvrables</option>
              </select>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Délai affiché aux clients lors de la commande</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Zones de livraison</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya'].map((zone) => (
                  <label key={zone} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={livraison.zonesLivraison.includes(zone)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLivraison({ ...livraison, zonesLivraison: [...livraison.zonesLivraison, zone] });
                        } else {
                          setLivraison({ ...livraison, zonesLivraison: livraison.zonesLivraison.filter(z => z !== zone) });
                        }
                      }}
                      disabled={!editing || !livraison.livraisonActive}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{zone}</span>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Sélectionnez les villes où vous livrez</p>
            </div>
          </div>
        </div>
      )}

      {/* Onglet En livraison */}
      {activeTab === 'en-cours' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Truck size={24} color="#2563eb" />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Commandes en livraison</h2>
          </div>

          {commandesEnLivraison.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {commandesEnLivraison.map((commande) => (
                <div key={commande.id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fef3c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                        {commande.numero || `CMD-${commande.id?.slice(-6)}`}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} />
                          <span>{commande.clientNom || 'Client inconnu'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} />
                          <span>{commande.clientTelephone || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          <span>{commande.dateCreation ? new Date(commande.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706', marginBottom: '8px' }}>
                        {(commande.total || 0).toLocaleString()} FCFA
                      </p>
                      <button
                        onClick={() => marquerLivree(commande.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle size={16} />
                        Marquer livrée
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Package size={16} />
                    <span>{(commande.items?.length || 0)} article(s) en cours de livraison</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px' }}>Aucune commande en cours de livraison</p>
            </div>
          )}
        </div>
      )}

      {/* Onglet Livrées */}
      {activeTab === 'livrees' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <CheckCircle size={24} color="#10b981" />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Commandes livrées</h2>
          </div>

          {commandesLivrees.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {commandesLivrees.map((commande) => (
                <div key={commande.id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f0fdf4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                        {commande.numero || `CMD-${commande.id?.slice(-6)}`}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} />
                          <span>{commande.clientNom || 'Client inconnu'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} />
                          <span>{commande.clientTelephone || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          <span>{commande.dateCreation ? new Date(commande.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                        {(commande.total || 0).toLocaleString()} FCFA
                      </p>
                      <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        ✓ Livrée
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <Package size={16} />
                    <span>{(commande.items?.length || 0)} article(s) livrés avec succès</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px' }}>Aucune commande livrée pour le moment</p>
            </div>
          )}
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