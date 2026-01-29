#!/usr/bin/env pwsh

Write-Host "TEST ENDPOINTS VARIANTES NETTOYES" -ForegroundColor Green

$headers = @{
    "X-User-Id" = "123e4567-e89b-12d3-a456-426614174000"
    "Content-Type" = "application/json"
}

Write-Host "Test GET variantes..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/variantes" -Method GET -Headers $headers
    
    Write-Host "GET REUSSI!" -ForegroundColor Green
    Write-Host "Nombre de variantes: $($getResponse.Count)" -ForegroundColor White
    $getResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test POST variante..." -ForegroundColor White

$postData = @{
    couleur = "Rouge"
    taille = "L"
    stock = 5
    prixAjustement = 0
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/variantes" -Method POST -Body $postData -Headers $headers
    
    Write-Host "POST REUSSI!" -ForegroundColor Green
    Write-Host "Variante creee:" -ForegroundColor White
    $postResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test stock disponible..." -ForegroundColor White

try {
    $stockResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/stock-disponible" -Method GET -Headers $headers
    
    Write-Host "STOCK OK!" -ForegroundColor Green
    $stockResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "ENDPOINTS NETTOYES:" -ForegroundColor Cyan
Write-Host "GET /api/vendeur/produits/{id}/variantes" -ForegroundColor Gray
Write-Host "POST /api/vendeur/produits/{id}/variantes" -ForegroundColor Gray
Write-Host "PUT /api/vendeur/produits/{id}/variantes/{varianteId}" -ForegroundColor Gray
Write-Host "DELETE /api/vendeur/produits/{id}/variantes/{varianteId}" -ForegroundColor Gray
Write-Host "GET /api/vendeur/produits/{id}/stock-disponible" -ForegroundColor Gray