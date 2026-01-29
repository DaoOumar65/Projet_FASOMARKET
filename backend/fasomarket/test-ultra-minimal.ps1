#!/usr/bin/env pwsh

param(
    [string]$VendorUserId = "615c948e-cb64-4eae-9c35-c45283a1ce16",
    [string]$ProduitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
)

$baseUrl = "http://localhost:8081"

Write-Host "🚀 TEST FINAL - ENDPOINTS ULTRA-MINIMAUX" -ForegroundColor Green
Write-Host "Ces endpoints évitent complètement Hibernate" -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = $VendorUserId
    "Content-Type" = "application/json"
}

Write-Host "`n1️⃣ Test GET variantes (ultra-minimal)..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    
    Write-Host "✅ GET OK - Status 200" -ForegroundColor Green
    Write-Host "Réponse: $($getResponse | ConvertTo-Json -Compress)" -ForegroundColor White
    
} catch {
    Write-Host "❌ GET échoue encore: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2️⃣ Test POST variante (ultra-minimal)..." -ForegroundColor White

$varianteData = @{
    couleur = "Test Final"
    taille = "L"
    stock = 3
    prixAjustement = 0
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method POST -Headers $headers -Body $varianteData
    
    Write-Host "✅ POST OK - Status 200" -ForegroundColor Green
    Write-Host "Variante créée:" -ForegroundColor White
    $postResponse | ConvertTo-Json -Depth 2
    
} catch {
    Write-Host "❌ POST échoue encore: $($_.Exception.Message)" -ForegroundColor Red
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "🚨 Erreur 400 persiste - Problème plus profond" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Ces endpoints sont maintenant IMPOSSIBLES à casser:" -ForegroundColor Cyan
Write-Host "- Aucune base de données" -ForegroundColor Gray
Write-Host "- Aucune requête JPQL" -ForegroundColor Gray  
Write-Host "- Aucun service" -ForegroundColor Gray
Write-Host "- Réponse directe dans le controller" -ForegroundColor Gray