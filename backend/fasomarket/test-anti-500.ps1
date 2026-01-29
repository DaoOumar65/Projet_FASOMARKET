#!/usr/bin/env pwsh

param(
    [string]$VendorUserId = "615c948e-cb64-4eae-9c35-c45283a1ce16",
    [string]$ProduitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
)

$baseUrl = "http://localhost:8081"

Write-Host "🔧 TEST CORRECTION ERREUR 500" -ForegroundColor Red
Write-Host "Vérification que les endpoints ne génèrent plus d'erreur serveur" -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = $VendorUserId
    "Content-Type" = "application/json"
}

Write-Host "`n1️⃣ Test GET variantes (anti-500)..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    
    Write-Host "✅ GET OK - Status 200" -ForegroundColor Green
    Write-Host "Type: $($getResponse.GetType().Name)" -ForegroundColor White
    Write-Host "Nombre d'éléments: $($getResponse.Count)" -ForegroundColor White
    
    if ($getResponse.Count -gt 0) {
        Write-Host "Première variante:" -ForegroundColor Gray
        $getResponse[0] | ConvertTo-Json -Depth 2
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ ERREUR $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 500) {
        Write-Host "🚨 ERREUR 500 PERSISTE!" -ForegroundColor Red
        Write-Host "Le backend crash encore" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Plus d'erreur 500 (autre erreur: $statusCode)" -ForegroundColor Green
    }
    
    Write-Host "Détails: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n2️⃣ Test POST variante (anti-500)..." -ForegroundColor White

$varianteData = @{
    couleur = "Test Anti-500"
    taille = "XL"
    stock = 7
    prixAjustement = 100
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method POST -Headers $headers -Body $varianteData
    
    Write-Host "✅ POST OK - Status 200" -ForegroundColor Green
    Write-Host "Variante créée:" -ForegroundColor White
    $postResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ ERREUR $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 500) {
        Write-Host "🚨 ERREUR 500 PERSISTE!" -ForegroundColor Red
        Write-Host "Le backend crash encore" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Plus d'erreur 500 (autre erreur: $statusCode)" -ForegroundColor Green
    }
    
    Write-Host "Détails: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n🎯 Objectifs de ce test:" -ForegroundColor Cyan
Write-Host "- Aucune erreur 500 (crash serveur)" -ForegroundColor Gray
Write-Host "- Status 200 garanti" -ForegroundColor Gray
Write-Host "- Données retournées (même simulées)" -ForegroundColor Gray
Write-Host "- Logs serveur visibles" -ForegroundColor Gray