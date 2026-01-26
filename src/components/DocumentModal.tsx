import { useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  vendeurId: string;
  vendeurNom: string;
}

export default function DocumentModal({ 
  isOpen, 
  onClose, 
  documentUrl, 
  vendeurNom
}: DocumentModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 50, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '16px' 
      }}
    >
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        maxWidth: '900px', 
        width: '100%', 
        maxHeight: '90vh', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 24px', 
          borderBottom: '1px solid #e5e7eb' 
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
              Document IFU - {vendeurNom}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Visualisation du document IFU
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              padding: '8px', 
              backgroundColor: '#f3f4f6', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Document viewer */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '500px'
        }}>
          <div style={{ 
            flex: 1, 
            backgroundColor: '#f8fafc', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '16px',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1'
          }}>
            {documentUrl ? (
              <iframe
                src={`http://localhost:8081/api/files/view/${documentUrl.includes('/') ? documentUrl.split('/').pop() : documentUrl}`}
                style={{
                  width: '100%',
                  height: '500px',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title="Document IFU"
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <FileText size={48} style={{ margin: '0 auto 16px' }} />
                <p>Aucun document disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}