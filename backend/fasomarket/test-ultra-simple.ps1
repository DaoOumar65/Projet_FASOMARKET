#!/usr/bin/env pwsh

Write-Host "TEST CONTROLLER ULTRA-SIMPLE" -ForegroundColor Green

$headers = @{
    "Content-Type" = "application/json"
}

$testData = @{
    nom = "Produit Test"
    status = "ACTIVE"
    prix = 150.0
} | ConvertTo-Json

Write-Host "Test PUT avec ID réel..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/a5309966-df13-4556-b4b6-1005ebe1f51d" -Method PUT -Body $testData -Headers $headers
    Write-Host "SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

Write-Host "Test GET..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/a5309966-df13-4556-b4b6-1005ebe1f51d" -Method GET
    Write-Host "SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "CONTROLLER ULTRA-SIMPLE - REPONSES SIMULEES!" -ForegroundColor Cyan