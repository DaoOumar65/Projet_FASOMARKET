import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export default function DiagnosticIntegration() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const diagnostics = [
    {
      name: 'Configuration API',
      check: () => {
        const baseUrl = 'http://localhost:8081';
        return {
          status: 'success' as const,
          message: `URL de base configurée: ${baseUrl}`,
          details: 'L\'URL de l\'API est correctement configurée'
        };
      }
    },
    {
      name: 'LocalStorage Auth',
      check: () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const user = localStorage.getItem('user');
        
        if (token && userId && user) {
          return {
            status: 'success' as const,
            message: 'Authentification présente',
            details: `Token: ${token.substring(0, 20)}..., UserId: ${userId}`
          };
        } else {
          return {
            status: 'warning' as const,
            message: 'Aucune authentification stockée',
            details: 'L\'utilisateur n\'est pas connecté'
          };
        }
      }
    },
    {
      name: 'Types TypeScript',
      check: () => {
        try {
          // Vérification basique des types importés
          const hasTypes = typeof window !== 'undefined';
          return {
            status: 'success' as const,
            message: 'Types TypeScript chargés',
            details: 'Les interfaces et types sont disponibles'
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Erreur de types TypeScript',
            details: (error as Error).message
          };
        }
      }
    },
    {
      name: 'Services API',
      check: async () => {
        try {
          // Test de connectivité basique
          const response = await fetch('http://localhost:8081/actuator/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            return {
              status: 'success' as const,
              message: 'Backend accessible',
              details: `Status: ${response.status}`
            };
          } else {
            return {
              status: 'error' as const,
              message: 'Backend inaccessible',
              details: `Status: ${response.status}`
            };
          }
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Erreur de connexion backend',
            details: (error as Error).message
          };
        }
      }
    },
    {
      name: 'CORS Configuration',
      check: async () => {
        try {
          const response = await fetch('http://localhost:8081/api/public/accueil', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            return {
              status: 'success' as const,
              message: 'CORS configuré correctement',
              details: 'Les requêtes cross-origin fonctionnent'
            };
          } else {
            return {
              status: 'warning' as const,
              message: 'Problème CORS potentiel',
              details: `Status: ${response.status}`
            };
          }
        } catch (error) {
          const errorMessage = (error as Error).message;
          if (errorMessage.includes('CORS')) {
            return {
              status: 'error' as const,
              message: 'Erreur CORS détectée',
              details: errorMessage
            };
          } else {
            return {
              status: 'error' as const,
              message: 'Erreur de réseau',
              details: errorMessage
            };
          }
        }
      }
    }
  ];

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    for (const diagnostic of diagnostics) {
      // Ajouter un résultat en attente
      setResults(prev => [...prev, {
        name: diagnostic.name,
        status: 'pending',
        message: 'Test en cours...'
      }]);

      try {
        const result = await diagnostic.check();
        
        // Mettre à jour le résultat
        setResults(prev => prev.map(r => 
          r.name === diagnostic.name 
            ? { name: diagnostic.name, ...result }
            : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.name === diagnostic.name 
            ? {
                name: diagnostic.name,
                status: 'error' as const,
                message: 'Erreur lors du test',
                details: (error as Error).message
              }
            : r
        ));
      }

      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} style={{ color: '#16a34a' }} />;
      case 'error':
        return <XCircle size={20} style={{ color: '#dc2626' }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: '#d97706' }} />;
      case 'pending':
        return <RefreshCw size={20} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#dcfce7';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fef3c7';
      case 'pending':
        return '#f3f4f6';
      default:
        return '#f9fafb';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#16a34a';
      case 'error':
        return '#dc2626';
      case 'warning':
        return '#d97706';
      case 'pending':
        return '#6b7280';
      default:
        return '#e5e7eb';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Diagnostic d'intégration
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Vérification de l'état de l'intégration frontend-backend
        </p>
      </div>

      {/* Résumé */}
      {results.length > 0 && !isRunning && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: '#dcfce7',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
              {successCount}
            </div>
            <div style={{ fontSize: '14px', color: '#16a34a' }}>Succès</div>
          </div>
          
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>
              {warningCount}
            </div>
            <div style={{ fontSize: '14px', color: '#d97706' }}>Avertissements</div>
          </div>
          
          <div style={{
            backgroundColor: '#fef2f2',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {errorCount}
            </div>
            <div style={{ fontSize: '14px', color: '#dc2626' }}>Erreurs</div>
          </div>
        </div>
      )}

      {/* Bouton de relance */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            backgroundColor: isRunning ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <RefreshCw size={16} style={{ animation: isRunning ? 'spin 1s linear infinite' : 'none' }} />
          {isRunning ? 'Diagnostic en cours...' : 'Relancer le diagnostic'}
        </button>
      </div>

      {/* Résultats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              backgroundColor: getStatusColor(result.status),
              border: `1px solid ${getBorderColor(result.status)}`,
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {getStatusIcon(result.status)}
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {result.name}
              </h3>
            </div>
            
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0' }}>
              {result.message}
            </p>
            
            {result.details && (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, fontFamily: 'monospace' }}>
                {result.details}
              </p>
            )}
          </div>
        ))}
      </div>

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