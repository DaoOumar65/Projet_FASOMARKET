#!/usr/bin/env pwsh

Write-Host "TEST NOUVEAU CONTROLLER - MAPPING DIFFERENT" -ForegroundColor Green

Write-Host "Test GET variantes (nouveau mapping)..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/variantes/produit/test-id" -Method GET
    
    Write-Host "GET REUSSI!" -ForegroundColor Green
    Write-Host "Nombre de variantes: $($getResponse.Count)" -ForegroundColor White
    $getResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test POST variante (nouveau mapping)..." -ForegroundColor White

$postData = @{
    couleur = "Vert"
    taille = "XL"
    stock = 8
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/variantes/produit/test-id" -Method POST -Body $postData -ContentType "application/json"
    
    Write-Host "POST REUSSI!" -ForegroundColor Green
    Write-Host "Variante creee:" -ForegroundColor White
    $postResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test stock (nouveau mapping)..." -ForegroundColor White

try {
    $stockResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/variantes/stock/test-id" -Method GET
    
    Write-Host "STOCK OK!" -ForegroundColor Green
    $stockResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
}

Write-Host "NOUVEAUX ENDPOINTS:" -ForegroundColor Cyan
Write-Host "GET /api/variantes/produit/{id}" -ForegroundColor Gray
Write-Host "POST /api/variantes/produit/{id}" -ForegroundColor Gray
Write-Host "GET /api/variantes/stock/{id}" -ForegroundColor Gray