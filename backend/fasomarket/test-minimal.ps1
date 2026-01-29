#!/usr/bin/env pwsh

Write-Host "🔥 TEST ENDPOINTS ULTRA-MINIMAUX" -ForegroundColor Red
Write-Host "Ces endpoints ne peuvent PHYSIQUEMENT PAS échouer" -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = "615c948e-cb64-4eae-9c35-c45283a1ce16"
    "Content-Type" = "application/json"
}

Write-Host "`n1️⃣ Test GET (données fixes)..." -ForegroundColor White
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/variantes" -Method GET -Headers $headers
    
    Write-Host "✅ GET RÉUSSI!" -ForegroundColor Green
    Write-Host "Données retournées:" -ForegroundColor White
    $getResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ ÉCHEC IMPOSSIBLE - Status: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 500) {
        Write-Host "🚨 ERREUR 500 IMPOSSIBLE!" -ForegroundColor Red
        Write-Host "L'endpoint ne fait AUCUN appel externe!" -ForegroundColor Yellow
    }
}

Write-Host "`n2️⃣ Test POST (réponse fixe)..." -ForegroundColor White

$postData = @{
    couleur = "Test Minimal"
    taille = "S"
    stock = 1
} | ConvertTo-Json

try {
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/vendeur/produits/test-id/variantes" -Method POST -Headers $headers -Body $postData
    
    Write-Host "✅ POST RÉUSSI!" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor White
    $postResponse | ConvertTo-Json -Depth 2
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ ÉCHEC IMPOSSIBLE - Status: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 500) {
        Write-Host "🚨 ERREUR 500 IMPOSSIBLE!" -ForegroundColor Red
        Write-Host "L'endpoint ne fait AUCUN appel externe!" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Ces endpoints:" -ForegroundColor Cyan
Write-Host "- Ne font AUCUN appel DB" -ForegroundColor Gray
Write-Host "- Ne font AUCUN appel service" -ForegroundColor Gray
Write-Host "- Retournent des données fixes" -ForegroundColor Gray
Write-Host "- Sont IMPOSSIBLES à crasher" -ForegroundColor Gray