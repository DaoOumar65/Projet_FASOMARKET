#!/usr/bin/env node

/**
 * Script de validation de l'intégration frontend-backend
 * Teste tous les endpoints critiques
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Tests des endpoints
const tests = [
  {
    name: 'Backend Health Check',
    test: async () => {
      const response = await api.get('/actuator/health');
      return response.status === 200;
    }
  },
  {
    name: 'Public - Accueil',
    test: async () => {
      const response = await api.get('/api/public/accueil');
      return response.status === 200 && response.data;
    }
  },
  {
    name: 'Public - Catégories',
    test: async () => {
      const response = await api.get('/api/public/categories');
      return response.status === 200;
    }
  },
  {
    name: 'Public - Boutiques',
    test: async () => {
      const response = await api.get('/api/public/boutiques');
      return response.status === 200;
    }
  },
  {
    name: 'Public - Produits',
    test: async () => {
      const response = await api.get('/api/public/produits');
      return response.status === 200;
    }
  },
  {
    name: 'Auth - Connexion Admin',
    test: async () => {
      const response = await api.post('/api/auth/connexion', {
        telephone: '+22665300000',
        motDePasse: 'admin123'
      });
      
      if (response.status === 200 && response.data.token) {
        // Stocker le token pour les tests suivants
        api.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;
        api.defaults.headers['X-User-Id'] = response.data.userId;
        return true;
      }
      return false;
    }
  },
  {
    name: 'Admin - Dashboard',
    test: async () => {
      const response = await api.get('/api/admin/dashboard');
      return response.status === 200;
    }
  },
  {
    name: 'Admin - Validations',
    test: async () => {
      const response = await api.get('/api/admin/validations');
      return response.status === 200;
    }
  },
  {
    name: 'Admin - Utilisateurs',
    test: async () => {
      const response = await api.get('/api/admin/utilisateurs');
      return response.status === 200;
    }
  }
];

async function runTests() {
  log('🚀 Démarrage des tests d\'intégration...', 'blue');
  log('');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of tests) {
    try {
      log(`⏳ Test: ${testCase.name}`, 'yellow');
      const result = await testCase.test();
      
      if (result) {
        log(`✅ ${testCase.name} - SUCCÈS`, 'green');
        passed++;
      } else {
        log(`❌ ${testCase.name} - ÉCHEC`, 'red');
        failed++;
      }
    } catch (error) {
      log(`❌ ${testCase.name} - ERREUR: ${error.message}`, 'red');
      failed++;
    }
    log('');
  }
  
  log('📊 Résultats des tests:', 'blue');
  log(`✅ Tests réussis: ${passed}`, 'green');
  log(`❌ Tests échoués: ${failed}`, 'red');
  log(`📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`, 'blue');
  
  if (failed === 0) {
    log('🎉 Tous les tests sont passés ! L\'intégration est fonctionnelle.', 'green');
  } else {
    log('⚠️  Certains tests ont échoué. Vérifiez la configuration du backend.', 'yellow');
  }
}

// Vérification de la connectivité de base
async function checkConnectivity() {
  try {
    log('🔍 Vérification de la connectivité backend...', 'blue');
    const response = await axios.get(`${API_BASE_URL}/actuator/health`, { timeout: 5000 });
    log('✅ Backend accessible', 'green');
    return true;
  } catch (error) {
    log('❌ Backend inaccessible:', 'red');
    log(`   URL: ${API_BASE_URL}`, 'red');
    log(`   Erreur: ${error.message}`, 'red');
    log('', 'reset');
    log('💡 Solutions possibles:', 'yellow');
    log('   1. Vérifiez que le backend Spring Boot est démarré', 'yellow');
    log('   2. Vérifiez que le port 8081 est libre', 'yellow');
    log('   3. Vérifiez la configuration CORS', 'yellow');
    return false;
  }
}

// Point d'entrée principal
async function main() {
  log('🔧 Script de validation de l\'intégration FasoMarket', 'blue');
  log('================================================', 'blue');
  log('');
  
  const isConnected = await checkConnectivity();
  
  if (isConnected) {
    log('');
    await runTests();
  } else {
    process.exit(1);
  }
}

// Exécution
main().catch(error => {
  log(`💥 Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});