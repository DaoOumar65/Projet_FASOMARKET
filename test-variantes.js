// Test des endpoints variantes
// Ouvrir la console du navigateur et coller ce code pour tester

const testVariantes = async () => {
  const API_BASE = 'http://localhost:8081';
  
  try {
    // Test 1: Récupérer tous les produits
    console.log('🔍 Test 1: Récupération des produits...');
    const produitsResponse = await fetch(`${API_BASE}/api/public/produits?page=0&size=5`);
    const produits = await produitsResponse.json();
    console.log('Produits trouvés:', produits);
    
    if (produits.content && produits.content.length > 0) {
      const premierProduit = produits.content[0];
      console.log('Premier produit:', premierProduit);
      
      // Test 2: Récupérer les variantes du premier produit
      console.log(`🔍 Test 2: Récupération des variantes pour le produit ${premierProduit.id}...`);
      const variantesResponse = await fetch(`${API_BASE}/api/public/produits/${premierProduit.id}/variantes`);
      
      if (variantesResponse.ok) {
        const variantes = await variantesResponse.json();
        console.log('✅ Variantes trouvées:', variantes);
        
        if (variantes.length === 0) {
          console.log('⚠️ Aucune variante trouvée pour ce produit');
          console.log('💡 Suggestion: Créer des variantes de test dans la base de données');
        }
      } else {
        console.log('❌ Erreur lors de la récupération des variantes:', variantesResponse.status);
        console.log('💡 L\'endpoint /api/public/produits/{id}/variantes n\'existe peut-être pas encore');
      }
    } else {
      console.log('❌ Aucun produit trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.log('💡 Vérifiez que le backend est démarré sur le port 8081');
  }
};

// Exécuter le test
testVariantes();

// Script SQL pour créer des variantes de test
console.log(`
📝 Script SQL pour créer des variantes de test:

-- Remplacez 'VOTRE_PRODUIT_ID' par un ID de produit existant
INSERT INTO produit_variantes (id, produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
(1, 'VOTRE_PRODUIT_ID', 'Rouge', 'M', 'Standard', 15000, 10, 'TEST-RO-M-001'),
(2, 'VOTRE_PRODUIT_ID', 'Rouge', 'L', 'Standard', 15000, 5, 'TEST-RO-L-002'),
(3, 'VOTRE_PRODUIT_ID', 'Bleu', 'M', 'Standard', 16000, 8, 'TEST-BL-M-003'),
(4, 'VOTRE_PRODUIT_ID', 'Bleu', 'L', 'Standard', 16000, 3, 'TEST-BL-L-004');
`);