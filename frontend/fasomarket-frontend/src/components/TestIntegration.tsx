import { useState } from 'react';
import { publicService, authService, adminService } from '../services/api';
import toast from 'react-hot-toast';

export default function TestIntegration() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    try {
      setLoading(true);
      const result = await testFn();
      setResults(prev => ({ ...prev, [name]: { success: true, data: result.data } }));
      toast.success(`✅ ${name} - OK`);
    } catch (error: any) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: error.message } }));
      toast.error(`❌ ${name} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setResults({});
    
    // Test des endpoints publics
    await testEndpoint('Public - Accueil', () => publicService.getAccueil());
    await testEndpoint('Public - Catégories', () => publicService.getCategories());
    await testEndpoint('Public - Boutiques', () => publicService.getBoutiques());
    await testEndpoint('Public - Produits', () => publicService.getProduits());
    
    // Test de connexion admin (avec des identifiants de test)
    try {
      const loginResult = await authService.login('+22665300000', 'admin123');
      if (loginResult.data) {
        toast.success('✅ Connexion admin réussie');
        
        // Test des endpoints admin
        await testEndpoint('Admin - Dashboard', () => adminService.getDashboard());
        await testEndpoint('Admin - Validations', () => adminService.getValidations());
        await testEndpoint('Admin - Utilisateurs', () => adminService.getUtilisateurs());
        await testEndpoint('Admin - Boutiques', () => adminService.getBoutiques());
      }
    } catch (error: any) {
      toast.error(`❌ Connexion admin échouée: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Test d'intégration API</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Test en cours...' : 'Lancer les tests'}
      </button>

      <div style={{ display: 'grid', gap: '12px' }}>
        {Object.entries(results).map(([name, result]: [string, any]) => (
          <div
            key={name}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: result.success ? '#dcfce7' : '#fef2f2',
              border: `1px solid ${result.success ? '#16a34a' : '#dc2626'}`
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {result.success ? '✅' : '❌'} {name}
            </div>
            {result.success ? (
              <div style={{ fontSize: '12px', color: '#16a34a' }}>
                Succès - {JSON.stringify(result.data).length} caractères de données
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#dc2626' }}>
                Erreur: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}