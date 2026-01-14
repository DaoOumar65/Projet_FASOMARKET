# Test complet workflow avec Paiement et Notifications
# Exécuter avec: .\test-workflow-complet.ps1

$baseUrl = "http://localhost:8081/api"

Write-Host "💳 Test Workflow Complet - Paiement & Notifications" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# 1. Créer un client
Write-Host "`n📋 1. Inscription client" -ForegroundColor Yellow
$clientData = @{
    nomComplet = "Charlie Client"
    telephone = "+22670777777"
    email = "charlie@client.com"
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

# 2. Créer un vendeur avec boutique et produit (version rapide)
Write-Host "`n📋 2. Setup vendeur complet" -ForegroundColor Yellow
$vendorData = @{
    nomComplet = "David Vendeur"
    telephone = "+22670888888"
    email = "david@vendeur.com"
    motDePasse = "password123"
    carteIdentite = "CI111222333"
} | ConvertTo-Json

$vendorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/inscription-vendeur" -Method Post -Body $vendorData -ContentType "application/json"
$vendorId = $vendorResponse.userId

$boutiqueData = @{
    nom = "Boutique Workflow Complet"
    description = "Test workflow complet"
    telephone = "+22670888888"
    adresse = "Secteur 30, Ouagadougou"
    categorie = "Électronique"
} | ConvertTo-Json

$vendorHeaders = @{ "Content-Type" = "application/json"; "X-User-Id" = $vendorId }
$boutiqueResponse = Invoke-RestMethod -Uri "$baseUrl/boutiques/creer" -Method Post -Body $boutiqueData -Headers $vendorHeaders
$boutiqueId = $boutiqueResponse.id

$produitData = @{
    nom = "Smartphone Test"
    description = "Téléphone pour test workflow"
    categorie = "Électronique"
    prix = 150000
    quantiteStock = 5
} | ConvertTo-Json

$produitResponse = Invoke-RestMethod -Uri "$baseUrl/produits/creer?boutiqueId=$boutiqueId" -Method Post -Body $produitData -Headers $vendorHeaders
$produitId = $produitResponse.id

Write-Host "✅ Setup vendeur terminé - Produit: $($produitResponse.nom)" -ForegroundColor Green

# 3. Client ajoute au panier et crée commande
Write-Host "`n📋 3. Panier et commande" -ForegroundColor Yellow
$clientHeaders = @{ "Content-Type" = "application/json"; "X-User-Id" = $clientId }

$panierData = @{ produitId = $produitId; quantite = 1 } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/panier/ajouter" -Method Post -Body $panierData -Headers $clientHeaders | Out-Null

$commandeData = @{ adresseLivraison = "456 Avenue Test, Ouagadougou" } | ConvertTo-Json
$commandeResponse = Invoke-RestMethod -Uri "$baseUrl/commandes/creer" -Method Post -Body $commandeData -Headers $clientHeaders
$commandeId = $commandeResponse.id

Write-Host "✅ Commande créée: $commandeId - Montant: $($commandeResponse.montantTotal) FCFA" -ForegroundColor Green

# 4. Vérifier notifications client
Write-Host "`n📋 4. Notifications client" -ForegroundColor Yellow
try {
    $notificationsClient = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers @{"X-User-Id" = $clientId}
    Write-Host "✅ Notifications client: $($notificationsClient.Count)" -ForegroundColor Green
    if ($notificationsClient.Count -gt 0) {
        Write-Host "   Dernière: $($notificationsClient[0].title)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erreur notifications: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Paiement de la commande
Write-Host "`n📋 5. Paiement commande" -ForegroundColor Yellow
$paiementData = @{
    commandeId = $commandeId
    methodePaiement = "MOBILE_MONEY"
    numeroTelephone = "+22670777777"
} | ConvertTo-Json

try {
    $paiementResponse = Invoke-RestMethod -Uri "$baseUrl/paiements/payer" -Method Post -Body $paiementData -Headers $clientHeaders
    Write-Host "✅ Paiement: $paiementResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur paiement: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Vérifier notifications après paiement
Write-Host "`n📋 6. Notifications après paiement" -ForegroundColor Yellow
try {
    $notificationsApres = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers @{"X-User-Id" = $clientId}
    Write-Host "✅ Nouvelles notifications client: $($notificationsApres.Count)" -ForegroundColor Green
    
    $notificationsVendeur = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Notifications vendeur: $($notificationsVendeur.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur notifications: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Vendeur confirme la commande
Write-Host "`n📋 7. Vendeur confirme" -ForegroundColor Yellow
try {
    $confirmationResponse = Invoke-RestMethod -Uri "$baseUrl/commandes/vendeur/$commandeId/statut?statut=CONFIRMED" -Method Put -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Commande confirmée: $($confirmationResponse.statut)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur confirmation: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Compteur notifications non lues
Write-Host "`n📋 8. Compteur notifications" -ForegroundColor Yellow
try {
    $compteurClient = Invoke-RestMethod -Uri "$baseUrl/notifications/compteur" -Method Get -Headers @{"X-User-Id" = $clientId}
    Write-Host "✅ Notifications non lues client: $compteurClient" -ForegroundColor Green
    
    $compteurVendeur = Invoke-RestMethod -Uri "$baseUrl/notifications/compteur" -Method Get -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Notifications non lues vendeur: $compteurVendeur" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur compteur: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Marquer notifications comme lues
Write-Host "`n📋 9. Marquer notifications lues" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/notifications/toutes-lues" -Method Put -Headers @{"X-User-Id" = $clientId} | Out-Null
    Write-Host "✅ Notifications client marquées comme lues" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur marquage: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Workflow complet terminé avec succès!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan