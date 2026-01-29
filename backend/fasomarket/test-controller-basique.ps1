#!/usr/bin/env pwsh

Write-Host "TEST CONTROLLER BASIQUE" -ForegroundColor Green

Write-Host "Test Hello World..." -ForegroundColor White
try {
    $helloResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/test/hello" -Method GET
    
    Write-Host "HELLO OK!" -ForegroundColor Green
    $helloResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "Test GET variantes..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/test/variantes/test-id" -Method GET
    
    Write-Host "GET OK!" -ForegroundColor Green
    Write-Host "Variantes: $($getResponse.Count)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
}

Write-Host "Test POST variante..." -ForegroundColor White

$postData = @{
    couleur = "Bleu"
    taille = "L"
    stock = 5
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/test/variantes/test-id" -Method POST -Body $postData -ContentType "application/json"
    
    Write-Host "POST OK!" -ForegroundColor Green
    Write-Host "ID: $($postResponse.id)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERREUR $statusCode" -ForegroundColor Red
}

Write-Host "ENDPOINTS DE TEST:" -ForegroundColor Cyan
Write-Host "GET /api/test/hello" -ForegroundColor Gray
Write-Host "GET /api/test/variantes/{id}" -ForegroundColor Gray
Write-Host "POST /api/test/variantes/{id}" -ForegroundColor Gray