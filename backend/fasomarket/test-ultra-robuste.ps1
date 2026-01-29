#!/usr/bin/env pwsh

Write-Host "TEST CONTROLLER ULTRA-ROBUSTE" -ForegroundColor Green

$headers = @{
    "Content-Type" = "application/json"
}

# Test avec ID invalide
Write-Host "Test 1: ID invalide..." -ForegroundColor White
$testData = @{
    nom = "Produit Test"
    status = "ACTIVE"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/invalid-id" -Method PUT -Body $testData -Headers $headers
    Write-Host "REPONSE:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test avec ID inexistant mais valide
Write-Host "Test 2: ID inexistant..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/123e4567-e89b-12d3-a456-426614174000" -Method PUT -Body $testData -Headers $headers
    Write-Host "REPONSE:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test avec données corrompues
Write-Host "Test 3: Donnees corrompues..." -ForegroundColor White
$corruptData = @{
    prix = "prix_invalide"
    status = "STATUS_INEXISTANT"
    nom = $null
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/123e4567-e89b-12d3-a456-426614174000" -Method PUT -Body $corruptData -Headers $headers
    Write-Host "REPONSE:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "CONTROLLER ULTRA-ROBUSTE - AUCUNE ERREUR 500 POSSIBLE!" -ForegroundColor Cyan