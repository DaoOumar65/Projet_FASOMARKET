#!/usr/bin/env pwsh

Write-Host "TEST CONTROLLER SIMPLE" -ForegroundColor Green

$headers = @{
    "X-User-Id" = "615c948e-cb64-4eae-9c35-c45283a1ce16"
    "Content-Type" = "application/json"
}

Write-Host "Test GET variantes..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/variantes" -Method GET -Headers $headers
    
    Write-Host "GET REUSSI!" -ForegroundColor Green
    Write-Host "Nombre de variantes: $($getResponse.Count)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test POST variante..." -ForegroundColor White

$postData = @{
    couleur = "Test"
    taille = "M"
    stock = 5
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/variantes" -Method POST -Headers $headers -Body $postData
    
    Write-Host "POST REUSSI!" -ForegroundColor Green
    Write-Host "ID cree: $($postResponse.id)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test stock-disponible..." -ForegroundColor White

try {
    $stockResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/stock-disponible" -Method GET -Headers $headers
    
    Write-Host "STOCK OK!" -ForegroundColor Green
    Write-Host "Stock global: $($stockResponse.stockGlobal)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
}

Write-Host "TESTS TERMINES" -ForegroundColor Cyan