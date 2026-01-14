#!/usr/bin/env node

/**
 * Script de test des endpoints manquants identifiés
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

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

// Tests des endpoints manquants prioritaires
const missingEndpointsTests = [
  {
    name: 'Client Dashboard',
    endpoint: '/api/client/dashboard',
    method: 'GET',
    requiresAuth: true,
    priority: 'HIGH',
    expectedFields: ['statistiques', 'commandesRecentes', 'recommandations']
  },
  {
    name: 'Vendeur Dashboard',
    endpoint: '/api/vendeur/dashboard',
    method: 'GET',
    requiresAuth: true,
    priority: 'HIGH',
    expectedFields: ['statistiques', 'boutique', 'commandesRecentes']
  },
  {
    name: 'Admin Dashboard',
    endpoint: '/api/admin/dashboard',
    method: 'GET',
    requiresAuth: true,
    priority: 'HIGH',
    expectedFields: ['statistiques', 'vendeursEnAttente', 'boutiquesEnAttente']
  },
  {
    name: 'Vendeur Analytics',
    endpoint: '/api/vendeur/analytics',
    method: 'GET',
    requiresAuth: true,
    priority: 'MEDIUM',
    expectedFields: ['ventesParMois', 'produitsPopulaires', 'statistiquesGenerales']
  },
  {
    name: 'Vendeur Gestion Stock',
    endpoint: '/api/vendeur/gestion-stock',
    method: 'GET',
    requiresAuth: true,
    priority: 'MEDIUM',
    expectedFields: ['produits', 'alertesStock']
  },
  {
    name: 'Client Favoris',
    endpoint: '/api/client/favoris',
    method: 'GET',
    requiresAuth: true,
    priority: 'MEDIUM',
    expectedFields: []
  },
  {
    name: 'Client Notifications Count',
    endpoint: '/api/client/notifications/compteur',
    method: 'GET',
    requiresAuth: true,
    priority: 'LOW',
    expectedFields: ['count']
  },
  {
    name: 'Vendeur Statut Compte',
    endpoint: '/api/vendeur/statut-compte',
    method: 'GET',
    requiresAuth: true,
    priority: 'HIGH',
    expectedFields: ['statutCompte']
  }
];

let authToken = null;
let adminUserId = null;

async function authenticate() {
  try {
    log('🔐 Tentative d\'authentification admin...', 'blue');
    const response = await api.post('/api/auth/connexion', {
      telephone: '+22665300000',
      motDePasse: 'admin123'
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      adminUserId = response.data.userId;
      
      // Configurer les headers pour les requêtes suivantes
      api.defaults.headers['Authorization'] = `Bearer ${authToken}`;
      api.defaults.headers['X-User-Id'] = adminUserId;
      
      log('✅ Authentification réussie', 'green');
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Échec de l'authentification: ${error.message}`, 'red');
    return false;
  }
}

async function testEndpoint(test) {
  try {
    log(`⏳ Test: ${test.name} [${test.priority}]`, 'yellow');
    
    const response = await api.request({
      method: test.method,
      url: test.endpoint
    });
    
    if (response.status === 200) {
      // Vérifier la structure des données
      const data = response.data;
      let structureValid = true;
      let missingFields = [];
      
      if (test.expectedFields && test.expectedFields.length > 0) {
        for (const field of test.expectedFields) {
          if (!data.hasOwnProperty(field)) {
            structureValid = false;
            missingFields.push(field);
          }
        }
      }
      
      if (structureValid) {
        log(`✅ ${test.name} - OK (${JSON.stringify(data).length} chars)`, 'green');
      } else {
        log(`⚠️  ${test.name} - Réponse OK mais structure incomplète`, 'yellow');
        log(`   Champs manquants: ${missingFields.join(', ')}`, 'yellow');
      }
      
      return { success: true, structureValid, missingFields, dataSize: JSON.stringify(data).length };
    } else {
      log(`❌ ${test.name} - Status ${response.status}`, 'red');
      return { success: false, status: response.status };
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        log(`❌ ${test.name} - ENDPOINT NON IMPLÉMENTÉ (404)`, 'red');
        return { success: false, status: 404, notImplemented: true };
      } else if (status === 500) {
        log(`❌ ${test.name} - ERREUR SERVEUR (500)`, 'red');
        return { success: false, status: 500, serverError: true };
      } else {
        log(`❌ ${test.name} - Status ${status}: ${error.response.data?.message || error.message}`, 'red');
        return { success: false, status, error: error.response.data?.message || error.message };
      }
    } else {
      log(`❌ ${test.name} - Erreur réseau: ${error.message}`, 'red');
      return { success: false, networkError: true, error: error.message };
    }
  }
}

async function runMissingEndpointsTests() {
  log('🔍 Test des endpoints manquants identifiés', 'blue');
  log('='.repeat(50), 'blue');
  log('');
  
  // Authentification
  const authSuccess = await authenticate();
  if (!authSuccess) {
    log('❌ Impossible de continuer sans authentification', 'red');
    return;
  }
  
  log('');
  
  // Grouper par priorité
  const highPriority = missingEndpointsTests.filter(t => t.priority === 'HIGH');
  const mediumPriority = missingEndpointsTests.filter(t => t.priority === 'MEDIUM');
  const lowPriority = missingEndpointsTests.filter(t => t.priority === 'LOW');
  
  const results = {
    implemented: 0,
    notImplemented: 0,
    serverErrors: 0,
    structureIssues: 0,
    total: missingEndpointsTests.length
  };
  
  // Tester par ordre de priorité
  for (const priorityGroup of [
    { name: 'HAUTE PRIORITÉ', tests: highPriority, color: 'red' },
    { name: 'MOYENNE PRIORITÉ', tests: mediumPriority, color: 'yellow' },
    { name: 'BASSE PRIORITÉ', tests: lowPriority, color: 'blue' }
  ]) {
    if (priorityGroup.tests.length > 0) {
      log(`📋 ${priorityGroup.name}`, priorityGroup.color);
      log('-'.repeat(30), priorityGroup.color);
      
      for (const test of priorityGroup.tests) {
        const result = await testEndpoint(test);
        
        if (result.success) {
          results.implemented++;
          if (!result.structureValid) {
            results.structureIssues++;
          }
        } else if (result.notImplemented) {
          results.notImplemented++;
        } else if (result.serverError) {
          results.serverErrors++;
        }
        
        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      log('');
    }
  }
  
  // Résumé
  log('📊 RÉSUMÉ DES TESTS', 'blue');
  log('='.repeat(30), 'blue');
  log(`✅ Endpoints implémentés: ${results.implemented}/${results.total}`, 'green');
  log(`❌ Endpoints manquants: ${results.notImplemented}/${results.total}`, 'red');
  log(`🔧 Erreurs serveur: ${results.serverErrors}/${results.total}`, 'yellow');
  log(`⚠️  Problèmes de structure: ${results.structureIssues}/${results.total}`, 'yellow');
  
  const implementationRate = Math.round((results.implemented / results.total) * 100);
  log(`📈 Taux d'implémentation: ${implementationRate}%`, implementationRate > 70 ? 'green' : 'yellow');
  
  log('');
  
  // Recommandations
  if (results.notImplemented > 0) {
    log('🎯 ACTIONS RECOMMANDÉES:', 'blue');
    log('1. Implémenter les endpoints manquants (priorité HAUTE)', 'yellow');
    log('2. Corriger les erreurs serveur', 'yellow');
    log('3. Vérifier les structures de données', 'yellow');
  } else {
    log('🎉 Tous les endpoints sont implémentés !', 'green');
  }
}

// Point d'entrée
async function main() {
  try {
    await runMissingEndpointsTests();
  } catch (error) {
    log(`💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();