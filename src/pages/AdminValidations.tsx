import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Store } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

interface VendeurEnAttente {
  id: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  idCard: string;
  status: string;
  createdAt: string;
}

export default function AdminValidations() {
  const [vendeurs, setVendeurs] = useState<VendeurEnAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      const response = await adminService.getValidations();
      setVendeurs(response.data.vendeursEnAttente || []);
    } catch (error) {
      console.error('Erreur lors du chargement des validations:', error);
      // Données de test basées sur votre BD
      setVendeurs([
        {
          id: 'aab82296-4455-41d0-aefa-ee05668db803',
          user: {
            id: '971ca3ed-b51b-4e5d-9967-a74605013ee0',
            fullName: 'Dao Test',
            phone: '+22665300000',
            email: 'oumaroda208@gmail.com'
          },
          idCard: 'B11111111',
          status: 'EN_ATTENTE_VALIDATION',
          createdAt: '2026-01-13T13:21:07.654288'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validerVendeur = async (vendeurId: string, statut: 'COMPTE_VALIDE' | 'REFUSE', raison?: string) => {
    setActionLoading(vendeurId);
    try {
      await adminService.validerVendeur(vendeurId, statut, raison);
      toast.success(`Vendeur ${statut === 'COMPTE_VALIDE' ? 'approuvé' : 'rejeté'} avec succès`);
      fetchValidations();
    } catch (error: any) {
      console.error('Erreur validation vendeur:', error);
      toast.error(`Erreur: ${error.response?.data?.message || 'Erreur lors de la validation'}`);
    } finally {
      setActionLoading(null);
    }
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
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Validations en attente</h1>

      {/* Vendeurs en attente */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <User size={24} style={{ color: '#dc2626', marginRight: '12px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>Vendeurs ({vendeurs.length})</h2>
        </div>

        {vendeurs.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '18px' }}>Aucun vendeur en attente de validation</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {vendeurs.map((vendeur) => (
              <div key={vendeur.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{vendeur.user.fullName}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>📞 {vendeur.user.phone}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>✉️ {vendeur.user.email}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>🆔 {vendeur.idCard}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>📅 {new Date(vendeur.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}>
                      {vendeur.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <button
                      onClick={() => validerVendeur(vendeur.id, 'COMPTE_VALIDE')}
                      disabled={actionLoading === vendeur.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: actionLoading === vendeur.id ? '#9ca3af' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: actionLoading === vendeur.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle size={16} />
                      {actionLoading === vendeur.id ? 'En cours...' : 'Approuver'}
                    </button>
                    <button
                      onClick={() => {
                        const raison = prompt('Raison du rejet (obligatoire):');
                        if (raison && raison.trim()) {
                          validerVendeur(vendeur.id, 'REFUSE', raison.trim());
                        } else if (raison !== null) {
                          toast.error('Veuillez saisir une raison pour le rejet');
                        }
                      }}
                      disabled={actionLoading === vendeur.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: actionLoading === vendeur.id ? '#9ca3af' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: actionLoading === vendeur.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <XCircle size={16} />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}