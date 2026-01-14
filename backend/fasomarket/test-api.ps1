# Tests des endpoints FasoMarket API - Version PowerShell
# Exécuter avec: .\test-api.ps1

$baseUrl = "http://localhost:8081/api/auth"

Write-Host "🧪 Tests FasoMarket API" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

Write-Host "`n📋 1. Test inscription client" -ForegroundColor Yellow
$clientData = @{
    nomComplet = "Jean Client"
    telephone = "+22670111111"
    email = "jean@client.com"
    motDePasse = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inscription-client" -Method Post -Body $clientData -ContentType "application/json"
    Write-Host "✅ Succès: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 2. Test inscription vendeur" -ForegroundColor Yellow
$vendorData = @{
    nomComplet = "Marie Vendeur"
    telephone = "+22670222222"
    email = "marie@vendeur.com"
    motDePasse = "password123"
    carteIdentite = "CI123456789"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inscription-vendeur" -Method Post -Body $vendorData -ContentType "application/json"
    Write-Host "✅ Succès: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 3. Test connexion client" -ForegroundColor Yellow
$loginData = @{
    telephone = "+22670111111"
    motDePasse = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/connexion" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Succès: Token reçu" -ForegroundColor Green
    $global:clientToken = $response.token
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Tests terminés!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan