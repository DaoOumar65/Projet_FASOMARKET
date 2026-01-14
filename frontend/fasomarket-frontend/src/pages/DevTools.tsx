import { useState } from 'react';
import { Settings, TestTube, Activity, FileText } from 'lucide-react';
import TestIntegration from '../components/TestIntegration';
import DiagnosticIntegration from '../components/DiagnosticIntegration';

type TabType = 'diagnostic' | 'test' | 'docs';

export default function DevTools() {
  const [activeTab, setActiveTab] = useState<TabType>('diagnostic');

  const tabs = [
    { id: 'diagnostic' as TabType, label: 'Diagnostic', icon: Activity },
    { id: 'test' as TabType, label: 'Tests API', icon: TestTube },
    { id: 'docs' as TabType, label: 'Documentation', icon: FileText }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'diagnostic':
        return <DiagnosticIntegration />;
      case 'test':
        return <TestIntegration />;
      case 'docs':
        return (
          <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Documentation d'intégration
            </h2>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                🚀 Démarrage rapide
              </h3>
              <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Démarrer le backend Spring Boot sur le port 8081</li>
                <li>Démarrer le frontend Vite sur le port 5173</li>
                <li>Utiliser l'onglet "Diagnostic" pour vérifier la connectivité</li>
                <li>Utiliser l'onglet "Tests API" pour valider les endpoints</li>
              </ol>
            </div>

            <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                ⚠️ Problèmes courants
              </h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>CORS :</strong> Vérifier la configuration CORS dans le backend</li>
                <li><strong>Port occupé :</strong> Libérer le port 5173 ou 8081</li>
                <li><strong>Authentification :</strong> Vérifier les identifiants admin</li>
                <li><strong>Base de données :</strong> S'assurer que H2 ou PostgreSQL est accessible</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#dcfce7', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                ✅ Endpoints testés
              </h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><code>/api/public/accueil</code> - Page d'accueil</li>
                <li><code>/api/public/categories</code> - Liste des catégories</li>
                <li><code>/api/auth/connexion</code> - Authentification</li>
                <li><code>/api/admin/dashboard</code> - Dashboard admin</li>
                <li><code>/api/admin/validations</code> - Validations en attente</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={24} style={{ color: '#2563eb' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              Outils de développement
            </h1>
          </div>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Diagnostic et tests d'intégration frontend-backend
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: isActive ? '#2563eb' : '#6b7280',
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.target as HTMLButtonElement).style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.target as HTMLButtonElement).style.color = '#6b7280';
                    }
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 0' }}>
        {renderContent()}
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb', 
        padding: '16px 0',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            FasoMarket - Outils de développement v1.0
          </p>
        </div>
      </div>
    </div>
  );
}