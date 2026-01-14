# Tests des endpoints Boutiques - Version PowerShell
# Exécuter avec: .\test-boutiques.ps1

$baseUrl = "http://localhost:8081/api"

Write-Host "🏪 Tests Boutiques FasoMarket" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# 1. Créer un vendeur d'abord
Write-Host "`n📋 1. Inscription vendeur" -ForegroundColor Yellow
$vendorData = @{
    nomComplet = "Marie Boutique"
    telephone = "+22670333333"
    email = "marie@boutique.com"
    motDePasse = "password123"
    carteIdentite = "CI987654321"
} | ConvertTo-Json

try {
    $vendorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/inscription-vendeur" -Method Post -Body $vendorData -ContentType "application/json"
    Write-Host "✅ Vendeur créé: $($vendorResponse.userId)" -ForegroundColor Green
    $vendorId = $vendorResponse.userId
} catch {
    Write-Host "❌ Erreur inscription vendeur: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Créer une boutique (simuler vendeur approuvé)
Write-Host "`n📋 2. Création boutique" -ForegroundColor Yellow
$boutiqueData = @{
    nom = "Boutique de Marie"
    description = "Vente de produits locaux et artisanaux"
    telephone = "+22670333333"
    adresse = "Secteur 15, Ouagadougou"
    email = "contact@boutiquemarie.com"
    categorie = "Alimentaire"
    horairesOuverture = '{"lun-ven": "08:00-18:00", "sam": "08:00-14:00"}'
    livraison = $true
    fraisLivraison = 1000
    tags = '["bio", "local", "artisanal"]'
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $vendorId
}

try {
    $boutiqueResponse = Invoke-RestMethod -Uri "$baseUrl/boutiques/creer" -Method Post -Body $boutiqueData -Headers $headers
    Write-Host "✅ Boutique créée: $($boutiqueResponse.nom)" -ForegroundColor Green
    $boutiqueId = $boutiqueResponse.id
} catch {
    Write-Host "❌ Erreur création boutique: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Récupérer mes boutiques
Write-Host "`n📋 3. Mes boutiques" -ForegroundColor Yellow
try {
    $mesBoutiques = Invoke-RestMethod -Uri "$baseUrl/boutiques/mes-boutiques" -Method Get -Headers @{"X-User-Id" = $vendorId}
    Write-Host "✅ Nombre de boutiques: $($mesBoutiques.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur récupération boutiques: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Boutiques actives (public)
Write-Host "`n📋 4. Boutiques actives" -ForegroundColor Yellow
try {
    $boutiquesActives = Invoke-RestMethod -Uri "$baseUrl/boutiques/actives" -Method Get
    Write-Host "✅ Boutiques actives: $($boutiquesActives.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur boutiques actives: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Tests boutiques terminés!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan