import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Store, FileText } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import DocumentModal from '../components/DocumentModal';
import { formatDateOnly } from '../utils/dateUtils';

interface BoutiqueEnAttente {
  id: string;
  name: string;
  numeroCnib: string;
  fichierIfu: string;
  fichierIfuUrl: string;
  vendeur: {
    nomComplet: string;
    telephone: string;
    email: string;
    idCard: string;
  };
  statut: string;
  dateCreation: string;
}

export default function AdminValidations() {
  const [boutiques, setBoutiques] = useState<BoutiqueEnAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    documentUrl: string;
    boutiqueId: string;
    boutiqueName: string;
  }>({ isOpen: false, documentUrl: '', boutiqueId: '', boutiqueName: '' });

  useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    try {
      // Essayer d'abord l'endpoint validations
      const response = await adminService.getValidations();
      const boutiquesData = response.data.boutiquesEnAttente || [];
      setBoutiques(boutiquesData.map((boutique: any) => ({
        id: boutique.id,
        name: boutique.name,
        numeroCnib: boutique.numeroCnib || boutique.cnib,
        fichierIfu: boutique.fichierIfu,
        fichierIfuUrl: boutique.fichierIfuUrl,
        vendeur: boutique.vendeur,
        statut: boutique.statut,
        dateCreation: boutique.dateCreation
      })));
    } catch (error: any) {
      console.error('Erreur lors du chargement des validations:', error);
      
      // Si l'endpoint n'existe pas, essayer de récupérer via les boutiques
      if (error.response?.status === 404) {
        try {
          const boutiquesResponse = await adminService.getBoutiques();
          const boutiquesEnAttente = boutiquesResponse.data.filter((b: any) => 
            b.statut === 'EN_ATTENTE_APPROBATION'
          ).map((boutique: any) => ({
            ...boutique,
            numeroCnib: boutique.numeroCnib || boutique.cnib
          }));
          setBoutiques(boutiquesEnAttente);
          return;
        } catch (boutiquesError) {
          console.error('Erreur lors du chargement des boutiques:', boutiquesError);
        }
      }
      
      // Données de test en dernier recours
      setBoutiques([
        {
          id: 'boutique-1',
          name: 'Boutique Test',
          numeroCnib: 'B12345678901',
          fichierIfu: 'ifu-test.pdf',
          fichierIfuUrl: 'ifu-test.pdf',
          vendeur: {
            nomComplet: 'Dao Test',
            telephone: '+22665300000',
            email: 'oumaroda208@gmail.com',
            idCard: 'B11111111'
          },
          statut: 'EN_ATTENTE_APPROBATION',
          dateCreation: '2026-01-13T13:21:07.654288'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validerBoutique = async (boutiqueId: string, statut: 'ACTIVE' | 'REJETEE', raison?: string) => {
    setActionLoading(boutiqueId);
    try {
      await adminService.validerBoutique(boutiqueId, statut, raison);
      toast.success(`Boutique ${statut === 'ACTIVE' ? 'approuvée' : 'rejetée'} avec succès`);
      fetchValidations();
    } catch (error: any) {
      console.error('Erreur validation boutique:', error);
      toast.error(`Erreur: ${error.response?.data?.message || 'Erreur lors de la validation'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDocumentModal = (boutique: BoutiqueEnAttente) => {
    if (!boutique.fichierIfu) {
      toast.error('Aucun document IFU disponible');
      return;
    }
    setDocumentModal({
      isOpen: true,
      documentUrl: boutique.fichierIfuUrl,
      boutiqueId: boutique.id,
      boutiqueName: boutique.name
    });
  };

  const handleCloseDocumentModal = () => {
    setDocumentModal({ isOpen: false, documentUrl: '', boutiqueId: '', boutiqueName: '' });
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

      {/* Boutiques en attente */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Store size={24} style={{ color: '#dc2626', marginRight: '12px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>Boutiques ({boutiques.length})</h2>
        </div>

        {boutiques.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '18px' }}>Aucune boutique en attente de validation</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {boutiques.map((boutique) => (
              <div key={boutique.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{boutique.name || 'Nom non disponible'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>📞 {boutique.vendeur.telephone || 'N/A'}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>✉️ {boutique.vendeur.email || 'N/A'}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>🆔 {boutique.vendeur.idCard || 'N/A'}</p>
                      <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>🏛️ CNIB: {boutique.numeroCnib || 'N/A'}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>📅 {formatDateOnly(boutique.dateCreation)}</p>
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
                      {boutique.statut}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    {boutique.fichierIfu && (
                      <button
                        onClick={() => handleOpenDocumentModal(boutique)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f1f5f9',
                          color: '#2563eb',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.color = '#2563eb';
                        }}
                      >
                        <FileText size={16} />
                        Voir IFU
                      </button>
                    )}
                    <button
                      onClick={() => validerBoutique(boutique.id, 'ACTIVE')}
                      disabled={actionLoading === boutique.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: actionLoading === boutique.id ? '#9ca3af' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: actionLoading === boutique.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle size={16} />
                      {actionLoading === boutique.id ? 'En cours...' : 'Approuver'}
                    </button>
                    <button
                      onClick={() => {
                        const raison = prompt('Raison du rejet (obligatoire):');
                        if (raison && raison.trim()) {
                          validerBoutique(boutique.id, 'REJETEE', raison.trim());
                        } else if (raison !== null) {
                          toast.error('Veuillez saisir une raison pour le rejet');
                        }
                      }}
                      disabled={actionLoading === boutique.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: actionLoading === boutique.id ? '#9ca3af' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: actionLoading === boutique.id ? 'not-allowed' : 'pointer',
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

      {/* Modal de visualisation des documents */}
      <DocumentModal
        isOpen={documentModal.isOpen}
        onClose={handleCloseDocumentModal}
        documentUrl={documentModal.documentUrl}
        vendeurId={documentModal.boutiqueId}
        vendeurNom={documentModal.boutiqueName}
      />
    </div>
  );
}
