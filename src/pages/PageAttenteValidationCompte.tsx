import { useState } from 'react';
import { vendorService } from '../services/api';
import { StatutCompteVendeur } from '../types';

export default function PageAttenteValidationCompte() {
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const response = await vendorService.getStatutCompte();
      if (response.data.statutCompte === StatutCompteVendeur.COMPTE_VALIDE) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
        padding: '48px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
        
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          Votre compte est en cours de validation
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px', 
          marginBottom: '32px' 
        }}>
          Nous vérifions vos documents d'identité
        </p>
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#16a34a'
            }}>
              <span>✅</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Inscription terminée</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#d97706'
            }}>
              <span>⏳</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Validation en cours</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#9ca3af'
            }}>
              <span>⏸️</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Création de boutique</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#9ca3af'
            }}>
              <span>⏸️</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Vente active</span>
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '32px' 
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            <strong>⏱️ Temps d'attente moyen:</strong> 24-48h
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#374151' 
          }}>
            <strong>📧 Notification:</strong> Vous serez informé par email
          </p>
        </div>
        
        <button
          onClick={checkStatus}
          disabled={isChecking}
          style={{
            padding: '12px 24px',
            backgroundColor: isChecking ? '#94a3b8' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isChecking ? 'Vérification...' : 'Vérifier le statut'}
        </button>
      </div>
    </div>
  );
}
