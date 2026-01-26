import { useState, useEffect } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

interface FactureData {
  numeroFacture: string;
  dateFacture: string;
  numeroCommande: string;
  statut: string;
  client: {
    nom: string;
    telephone: string;
  };
  vendeur: {
    nom: string;
    adresse: string;
    telephone: string;
  };
  articles: Array<{
    designation: string;
    quantite: number;
    prixUnitaire: number;
    total: number;
  }>;
  sousTotal: number;
  tva: number;
  totalTTC: number;
}

interface FactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  commandeId: string;
}

export default function FactureModal({ isOpen, onClose, commandeId }: FactureModalProps) {
  const [facture, setFacture] = useState<FactureData | null>(null);
  const [loading, setLoading] = useState(false);

  const genererFacture = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/vendeur/commandes/${commandeId}/facture`, {
        headers: {
          'X-User-Id': userId || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFacture(data);
      } else {
        toast.error('Impossible de générer la facture');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!facture) return;
    
    const element = document.getElementById('facture-content');
    const opt = {
      margin: 1,
      filename: `Facture-${facture.numeroFacture}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
    toast.success('Facture téléchargée en PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setFacture(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (!facture && !loading) {
    genererFacture();
  }

  return (
    <div onClick={handleBackdropClick} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderTop: '2px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p>Génération de la facture...</p>
          </div>
        ) : facture ? (
          <>
            {/* Header avec boutons */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Facture {facture.numeroFacture}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleDownloadPDF} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} /> Télécharger PDF
                </button>
                <button onClick={handlePrint} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={16} /> Imprimer
                </button>
                <button onClick={handleClose} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Contenu de la facture */}
            <div id="facture-content" style={{ padding: '32px' }}>
              {/* En-tête facture */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>FASOMARKET</h1>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    <p>{facture.vendeur.nom}</p>
                    <p>{facture.vendeur.adresse}</p>
                    <p>{facture.vendeur.telephone}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>FACTURE</h2>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>N°:</strong> {facture.numeroFacture}</p>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Date:</strong> {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}</p>
                  <p style={{ fontSize: '14px' }}><strong>Commande:</strong> {facture.numeroCommande}</p>
                </div>
              </div>

              {/* Informations client */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Facturé à:</h3>
                <div style={{ fontSize: '14px' }}>
                  <p>{facture.client.nom}</p>
                  <p>{facture.client.telephone}</p>
                </div>
              </div>

              {/* Tableau des articles */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>Désignation</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>Quantité</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>Prix Unitaire</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {facture.articles.map((article, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}>{article.designation}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e5e7eb', fontSize: '14px' }}>{article.quantite}</td>
                      <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb', fontSize: '14px' }}>{article.prixUnitaire.toLocaleString()} FCFA</td>
                      <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #e5e7eb', fontSize: '14px' }}>{article.total.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: '300px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                    <span>Sous-total:</span>
                    <span>{facture.sousTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                    <span>TVA (0%):</span>
                    <span>{facture.tva.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid #e5e7eb' }}>
                    <span>Total TTC:</span>
                    <span>{facture.totalTTC.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; }
            * { -webkit-print-color-adjust: exact; }
          }
        `}
      </style>
    </div>
  );
}