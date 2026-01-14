# Test complet workflow Commandes Client-Vendeur
# Exécuter avec: .\test-workflow-commandes.ps1

$baseUrl = "http://localhost:8081/api"

Write-Host "🛒 Test Workflow Commandes Client-Vendeur" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Créer un client
Write-Host "`n📋 1. Inscription client" -ForegroundColor Yellow
$clientData = @{
    nomComplet = "Alice Client"
    telephone = "+22670555555"
    email = "alice@client.com"
    motDePasse = "password123"
} | ConvertTo-Json

try {
    $clientResponse = Invoke-RestMethod -Uri "$baseUrl/auth/inscription-client" -Method Post -Body $clientData -ContentType "application/json"
    Write-Host "✅ Client créé: $($clientResponse.userId)" -ForegroundColor Green
    $clientId = $clientResponse.userId
} catch {
    Write-Host "❌ Erreur inscription client: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Créer un vendeur
Write-Host "`n📋 2. Inscription vendeur" -ForegroundColor Yellow
$vendorData = @{
    nomComplet = "Bob Vendeur"
    telephone = "+22670666666"
    email = "bob@vendeur.com"
    motDePasse = "password123"
    carteIdentite = "CI999888777"
} | ConvertTo-Json

try {
    $vendorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/inscription-vendeur" -Method Post -Body $vendorData -ContentType "application/json"
    Write-Host "✅ Vendeur créé: $($vendorResponse.userId)" -ForegroundColor Green
    $vendorId = $vendorResponse.userId
} catch {
    Write-Host "❌ Erreur inscription vendeur: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. Créer une boutique
Write-Host "`n📋 3. Création boutique" -ForegroundColor Yellow
$boutiqueData = @{
    nom = "Boutique Test Workflow"
    description = "Boutique pour tester le workflow"
    telephone = "+22670666666"
    adresse = "Secteur 25, Ouagadougou"
    email = "test@workflow.com"
    categorie = "Alimentaire"
    livraison = $true
    fraisLivraison = 1000
} | ConvertTo-Json

$vendorHeaders = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $vendorId
}

try {
    $boutiqueResponse = Invoke-RestMethod -Uri "$baseUrl/boutiques/creer" -Method Post -Body $boutiqueData -Headers $vendorHeaders
    Write-Host "✅ Boutique créée: $($boutiqueResponse.id)" -ForegroundColor Green
    $boutiqueId = $boutiqueResponse.id
} catch {
    Write-Host "❌ Erreur création boutique: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 4. Créer un produit
Write-Host "`n📋 4. Création produit" -ForegroundColor Yellow
$produitData = @{
    nom = "Produit Test Workflow"
    description = "Produit pour tester le workflow"
    categorie = "Test"
    prix = 2500
    quantiteStock = 10
} | ConvertTo-Json

try {
    $produitResponse = Invoke-RestMethod -Uri "$baseUrl/produits/creer?boutiqueId=$boutiqueId" -Method Post -Body $produitData -Headers $vendorHeaders
    Write-Host "✅ Produit créé: $($produitResponse.id)" -ForegroundColor Green
    $produitId = $produitResponse.id
} catch {
    Write-Host "❌ Erreur création produit: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 5. Client ajoute au panier
Write-Host "`n📋 5. Ajout au panier" -ForegroundColor Yellow
$panierData = @{
    produitId = $produitId
    quantite = 2
} | ConvertTo-Json

$clientHeaders = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $clientId
}

try {
    $panierResponse = Invoke-RestMethod -Uri "$baseUrl/panier/ajouter" -Method Post -Body $panierData -Headers $clientHeaders
    Write-Host "✅ Produit ajouté au panier: $($panierResponse.nomProduit)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur ajout panier: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Client crée la commande
Write-Host "`n📋 6. Création commande" -ForegroundColor Yellow
$commandeData = @{
    adresseLivraison = "123 Rue Test, Ouagadougou"
} | ConvertTo-Json

try {
    $commandeResponse = Invoke-RestMethod -Uri "$baseUrl/commandes/creer" -Method Post -Body $commandeData -Headers $clientHeaders
    Write-Host "✅ Commande créée: $($commandeResponse.id) - Montant: $($commandeResponse.montantTotal)" -ForegroundColor Green
    $commandeId = $commandeResponse.id
} catch {
    Write-Host "❌ Erreur création commande: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 7. Vendeur voit ses commandes
Write-Host "`n📋 7. Vendeur - Mes commandes" -ForegroundColor Yellow
try {
    $commandesVendeur = Invoke-RestMethod -Uri "$baseUrl/commandes/vendeur/mes-commandes" -Method Get -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Commandes vendeur: $($commandesVendeur.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur commandes vendeur: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Vendeur change le statut à CONFIRMED
Write-Host "`n📋 8. Vendeur confirme la commande" -ForegroundColor Yellow
try {
    $statutResponse = Invoke-RestMethod -Uri "$baseUrl/commandes/vendeur/$commandeId/statut?statut=CONFIRMED" -Method Put -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Statut changé: $($statutResponse.statut)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur changement statut: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Client voit ses commandes
Write-Host "`n📋 9. Client - Mes commandes" -ForegroundColor Yellow
try {
    $commandesClient = Invoke-RestMethod -Uri "$baseUrl/commandes/mes-commandes" -Method Get -Headers @{"X-User-Id" = $clientId}
    Write-Host "✅ Commandes client: $($commandesClient.Count) - Statut: $($commandesClient[0].statut)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur commandes client: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Vendeur expédie la commande
Write-Host "`n📋 10. Vendeur expédie la commande" -ForegroundColor Yellow
try {
    $expeditionResponse = Invoke-RestMethod -Uri "$baseUrl/commandes/vendeur/$commandeId/statut?statut=SHIPPED" -Method Put -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Commande expédiée: $($expeditionResponse.statut)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur expédition: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Workflow complet terminé!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan