#!/usr/bin/env pwsh

param(
    [string]$VendorUserId = "615c948e-cb64-4eae-9c35-c45283a1ce16",
    [string]$ProduitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
)

$baseUrl = "http://localhost:8080"

Write-Host "🧪 TEST URGENT - Résolution Erreur 400" -ForegroundColor Red
Write-Host "Endpoint: GET /api/vendeur/produits/$ProduitId/variantes" -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = $VendorUserId
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    
    Write-Host "✅ SUCCÈS! Erreur 400 résolue" -ForegroundColor Green
    Write-Host "Status: 200 OK" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
    
    if ($response -is [array]) {
        Write-Host "Type: Array (✓)" -ForegroundColor Green
        Write-Host "Nombre d'éléments: $($response.Count)" -ForegroundColor White
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ ÉCHEC - Status: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 400) {
        Write-Host "🚨 ERREUR 400 PERSISTE!" -ForegroundColor Red
        Write-Host "Le backend nécessite une correction urgente" -ForegroundColor Yellow
    }
    
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n🎯 Objectif: Status 200 avec liste vide []" -ForegroundColor Cyan