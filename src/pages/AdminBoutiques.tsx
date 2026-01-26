import { useState, useEffect } from 'react';
import { Store, Search, Filter, Eye, Ban, CheckCircle, FileText } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import DocumentModal from '../components/DocumentModal';
import { formatDateOnly } from '../utils/dateUtils';

const decodeHTML = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

interface Boutique {
  id: string;
  name?: string;  // Backend utilise 'name'
  nom?: string;   // Frontend utilise 'nom'
  description: string;
  address?: string;  // Backend utilise 'address'
  adresse?: string;  // Frontend utilise 'adresse'
  phone?: string;    // Backend utilise 'phone'
  telephone?: string; // Frontend utilise 'telephone'
  email?: string;
  numeroCnib?: string;
  cnib?: string;
  status?: 'ACTIVE' | 'EN_ATTENTE_APPROBATION' | 'SUSPENDUE' | 'REJETEE';
  statut?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  vendor?: {
    user?: {
      fullName?: string;
      phone?: string;
    };
  };
  vendeur?: {
    nomComplet: string;
    telephone: string;
  };
  createdAt?: string;
  dateCreation?: string;
  nombreProduits?: number;
  fichierIfuUrl?: string;
}

export default function AdminBoutiques() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    documentUrl: string;
    boutiqueId: string;
    boutiqueName: string;
  }>({ isOpen: false, documentUrl: '', boutiqueId: '', boutiqueName: '' });

  useEffect(() => {
    fetchBoutiques();
  }, [statutFilter]);

  const fetchBoutiques = async () => {
    try {
      const response = await adminService.getBoutiques();
      console.log('Données boutiques reçues:', response.data);
      
      // Récupérer les détails de chaque boutique pour avoir les infos du vendeur
      const boutiquesAvecDetails = await Promise.all(
        (response.data || []).map(async (boutique: Boutique) => {
          try {
            const details = await adminService.getBoutiqueDetails(boutique.id);
            return { 
              ...boutique, 
              ...details.data,
              numeroCnib: details.data.numeroCnib || details.data.cnib || boutique.numeroCnib || boutique.cnib
            };
          } catch (error) {
            console.error(`Erreur détails boutique ${boutique.id}:`, error);
            return {
              ...boutique,
              numeroCnib: boutique.numeroCnib || boutique.cnib
            };
          }
        })
      );
      
      console.log('Boutiques avec détails:', boutiquesAvecDetails);
      setBoutiques(boutiquesAvecDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques:', error);
      setBoutiques([]);
    }
    setLoading(false);
  };

  const changerStatutBoutique = async (boutiqueId: string, nouveauStatut: string, raison?: string) => {
    setActionLoading(boutiqueId);
    try {
      // Mapper les statuts frontend vers backend
      const statutBackend = nouveauStatut === 'ACTIVE' ? 'ACTIVE' : 
                           nouveauStatut === 'SUSPENDED' ? 'SUSPENDUE' : 
                           nouveauStatut === 'REJECTED' ? 'REJETEE' : 
                           nouveauStatut === 'PENDING' ? 'EN_ATTENTE_APPROBATION' : nouveauStatut;
      
      // Utiliser validerBoutique pour approbation/rejet, updateBoutiqueStatut pour autres changements
      if (nouveauStatut === 'ACTIVE' || nouveauStatut === 'REJECTED') {
        await adminService.validerBoutique(boutiqueId, statutBackend, raison);
      } else {
        await adminService.updateBoutiqueStatut(boutiqueId, statutBackend);
      }
      
      toast.success('Statut de la boutique modifié');
      fetchBoutiques();
    } catch (error: any) {
      console.error('Erreur changement statut:', error);
      console.error('Réponse détaillée:', error.response);
      
      let message = 'Erreur lors de la modification';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();
          message = errorMessages.join(', ');
        }
      }
      
      toast.error(`Erreur: ${message}`);
    } finally {
      setActionLoading(null);
      setShowRejectModal(null);
      setRejectReason('');
    }
  };

  const handleReject = (boutiqueId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Veuillez saisir une raison pour le rejet');
      return;
    }
    changerStatutBoutique(boutiqueId, 'REJECTED', rejectReason);
  };

  const handleOpenDocumentModal = (boutique: Boutique) => {
    if (!boutique.fichierIfuUrl) {
      toast.error('Aucun document IFU disponible');
      return;
    }
    setDocumentModal({
      isOpen: true,
      documentUrl: boutique.fichierIfuUrl,
      boutiqueId: boutique.id,
      boutiqueName: boutique.nom || boutique.name || 'Boutique'
    });
  };

  const handleCloseDocumentModal = () => {
    setDocumentModal({ isOpen: false, documentUrl: '', boutiqueId: '', boutiqueName: '' });
  };

  const filteredBoutiques = boutiques.filter(boutique => {
    const nom = boutique.nom || boutique.name || '';
    const vendeurNom = boutique.vendeur?.nomComplet || boutique.vendor?.user?.fullName || '';
    const adresse = boutique.adresse || boutique.address || '';
    
    const matchesSearch = nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendeurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adresse.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statut = boutique.statut || (boutique.status === 'EN_ATTENTE_APPROBATION' ? 'PENDING' : 
                                      boutique.status === 'SUSPENDUE' ? 'SUSPENDED' : 
                                      boutique.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
    const matchesStatut = !statutFilter || statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const getStatutBadge = (boutique: Boutique) => {
    const statut = boutique.statut || (boutique.status === 'EN_ATTENTE_APPROBATION' ? 'PENDING' : 
                                      boutique.status === 'SUSPENDUE' ? 'SUSPENDED' : 
                                      boutique.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
    
    const colors = {
      ACTIVE: { bg: '#dcfce7', text: '#16a34a' },
      PENDING: { bg: '#fef3c7', text: '#d97706' },
      SUSPENDED: { bg: '#fee2e2', text: '#dc2626' }
    };
    const color = colors[statut as keyof typeof colors] || colors.PENDING;
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: color.bg,
        color: color.text
      }}>
        {statut === 'ACTIVE' ? 'Active' : statut === 'PENDING' ? 'En attente' : 'Suspendue'}
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
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Gestion des boutiques</h1>
          <p style={{ color: '#6b7280' }}>{filteredBoutiques.length} boutiques trouvées</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Recherche */}
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Rechercher par nom, vendeur ou adresse..."
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

          {/* Filtre par statut */}
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
              <option value="ACTIVE">Actives</option>
              <option value="PENDING">En attente</option>
              <option value="SUSPENDED">Suspendues</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des boutiques */}
      {filteredBoutiques.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Store size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Aucune boutique trouvée</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredBoutiques.map((boutique) => (
            <div key={boutique.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginRight: '12px' }}>
                    {boutique.nom || boutique.name || 'Nom non disponible'}
                  </h3>
                    {getStatutBadge(boutique)}
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>{boutique.description}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📍</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{decodeHTML(boutique.adresse || boutique.address || 'N/A')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>👤</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {boutique.vendeur?.nomComplet ? decodeHTML(boutique.vendeur.nomComplet) : 
                         boutique.vendor?.user?.fullName ? decodeHTML(boutique.vendor.user.fullName) : 
                         'Vendeur non disponible'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📞</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{boutique.vendeur?.telephone || boutique.vendor?.user?.phone || boutique.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>🏛️</span>
                      <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>CNIB: {boutique.numeroCnib || boutique.cnib || 'Non fourni'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📅</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {formatDateOnly(boutique.dateCreation || boutique.createdAt)}
                      </span>
                    </div>
                    {boutique.nombreProduits !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>📦</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{boutique.nombreProduits} produits</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                  {boutique.fichierIfuUrl && (
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
                  {(boutique.statut === 'ACTIVE' || boutique.status === 'ACTIVE') && (
                    <button
                      onClick={() => changerStatutBoutique(boutique.id, 'SUSPENDED')}
                      disabled={actionLoading === boutique.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Ban size={16} />
                      Suspendre
                    </button>
                  )}
                  
                  {(boutique.statut === 'SUSPENDED' || boutique.status === 'SUSPENDUE') && (
                    <button
                      onClick={() => changerStatutBoutique(boutique.id, 'ACTIVE')}
                      disabled={actionLoading === boutique.id}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
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
                      Réactiver
                    </button>
                  )}
                  
                  {/* Boutiques en brouillon ou en attente */}
                  {(boutique.status === 'BROUILLON' || boutique.status === 'EN_ATTENTE_APPROBATION') && (
                    <>
                      <button
                        onClick={() => changerStatutBoutique(boutique.id, 'ACTIVE')}
                        disabled={actionLoading === boutique.id}
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
                        Approuver
                      </button>
                      <button
                        onClick={() => setShowRejectModal(boutique.id)}
                        disabled={actionLoading === boutique.id}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc2626',
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
                        <Ban size={16} />
                        Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de rejet */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Rejeter la boutique</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Veuillez indiquer la raison du rejet :</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Documents manquants, informations incomplètes..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectReason.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: rejectReason.trim() ? '#dc2626' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: rejectReason.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
      
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
