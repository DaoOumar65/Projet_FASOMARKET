# Tests CRUD complets Boutiques - Version PowerShell
# Exécuter avec: .\test-crud-boutiques.ps1

$baseUrl = "http://localhost:8081/api"

Write-Host "🏪 Tests CRUD Boutiques FasoMarket" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# 1. Créer un vendeur
Write-Host "`n📋 1. Inscription vendeur" -ForegroundColor Yellow
$vendorData = @{
    nomComplet = "Jean Vendeur"
    telephone = "+22670444444"
    email = "jean@vendeur.com"
    motDePasse = "password123"
    carteIdentite = "CI111222333"
} | ConvertTo-Json

try {
    $vendorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/inscription-vendeur" -Method Post -Body $vendorData -ContentType "application/json"
    Write-Host "✅ Vendeur créé: $($vendorResponse.userId)" -ForegroundColor Green
    $vendorId = $vendorResponse.userId
} catch {
    Write-Host "❌ Erreur inscription vendeur: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. CREATE - Créer une boutique
Write-Host "`n📋 2. CREATE - Création boutique" -ForegroundColor Yellow
$boutiqueData = @{
    nom = "Boutique Test CRUD"
    description = "Boutique pour tester les opérations CRUD"
    telephone = "+22670444444"
    adresse = "Secteur 20, Ouagadougou"
    email = "test@boutique.com"
    categorie = "Test"
    livraison = $true
    fraisLivraison = 500
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $vendorId
}

try {
    $boutiqueResponse = Invoke-RestMethod -Uri "$baseUrl/boutiques/creer" -Method Post -Body $boutiqueData -Headers $headers
    Write-Host "✅ Boutique créée: $($boutiqueResponse.nom) (ID: $($boutiqueResponse.id))" -ForegroundColor Green
    $boutiqueId = $boutiqueResponse.id
} catch {
    Write-Host "❌ Erreur création boutique: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. READ - Lire une boutique
Write-Host "`n📋 3. READ - Lecture boutique" -ForegroundColor Yellow
try {
    $boutique = Invoke-RestMethod -Uri "$baseUrl/boutiques/$boutiqueId" -Method Get
    Write-Host "✅ Boutique lue: $($boutique.nom) - Statut: $($boutique.statut)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lecture boutique: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. UPDATE - Modifier la boutique
Write-Host "`n📋 4. UPDATE - Modification boutique" -ForegroundColor Yellow
$updateData = @{
    description = "Description mise à jour via CRUD"
    categorie = "Alimentaire"
    fraisLivraison = 750
} | ConvertTo-Json

try {
    $updatedBoutique = Invoke-RestMethod -Uri "$baseUrl/boutiques/$boutiqueId" -Method Put -Body $updateData -Headers $headers
    Write-Host "✅ Boutique modifiée: $($updatedBoutique.description)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur modification boutique: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. READ ALL - Lister mes boutiques
Write-Host "`n📋 5. READ ALL - Mes boutiques" -ForegroundColor Yellow
try {
    $mesBoutiques = Invoke-RestMethod -Uri "$baseUrl/boutiques/mes-boutiques" -Method Get -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Nombre de boutiques: $($mesBoutiques.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur liste boutiques: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. SEARCH - Rechercher des boutiques
Write-Host "`n📋 6. SEARCH - Recherche boutiques" -ForegroundColor Yellow
try {
    $recherche = Invoke-RestMethod -Uri "$baseUrl/boutiques/rechercher?nom=Test&categorie=Alimentaire" -Method Get
    Write-Host "✅ Résultats recherche: $($recherche.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur recherche: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. DELETE - Supprimer la boutique
Write-Host "`n📋 7. DELETE - Suppression boutique" -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/boutiques/$boutiqueId" -Method Delete -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Boutique supprimée: $deleteResponse" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur suppression boutique: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Vérifier la suppression
Write-Host "`n📋 8. Vérification suppression" -ForegroundColor Yellow
try {
    $boutique = Invoke-RestMethod -Uri "$baseUrl/boutiques/$boutiqueId" -Method Get
    Write-Host "❌ La boutique existe encore!" -ForegroundColor Red
} catch {
    Write-Host "✅ Boutique bien supprimée (404 attendu)" -ForegroundColor Green
}

Write-Host "`n✅ Tests CRUD boutiques terminés!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan