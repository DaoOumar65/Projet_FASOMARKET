#!/usr/bin/env pwsh

param(
    [string]$VendorUserId = "615c948e-cb64-4eae-9c35-c45283a1ce16",
    [string]$ProduitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
)

$baseUrl = "http://localhost:8080"

Write-Host "🔧 TEST CORRECTION HIBERNATE" -ForegroundColor Red
Write-Host "Problème: Could not resolve attribute 'produitId'" -ForegroundColor Yellow
Write-Host "Solution: Utilisation de findByProduit_Id au lieu de findByProduitId" -ForegroundColor Green

$headers = @{
    "X-User-Id" = $VendorUserId
    "Content-Type" = "application/json"
}

Write-Host "`n1️⃣ Test endpoint variantes..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    
    Write-Host "✅ HIBERNATE OK - Pas d'erreur UnknownPathException" -ForegroundColor Green
    Write-Host "Status: 200 OK" -ForegroundColor Green
    Write-Host "Variantes trouvées: $($response.Count)" -ForegroundColor White
    
    if ($response.Count -gt 0) {
        Write-Host "Première variante:" -ForegroundColor Gray
        $response[0] | ConvertTo-Json -Depth 2
    } else {
        Write-Host "Liste vide (normal si aucune variante créée)" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = ""
    
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
    } catch {}
    
    Write-Host "❌ ERREUR $statusCode" -ForegroundColor Red
    
    if ($errorBody -like "*UnknownPathException*" -or $errorBody -like "*produitId*") {
        Write-Host "🚨 ERREUR HIBERNATE PERSISTE!" -ForegroundColor Red
        Write-Host "L'attribut 'produitId' n'est toujours pas résolu" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Hibernate OK - Autre type d'erreur" -ForegroundColor Green
    }
    
    Write-Host "Détails erreur: $errorBody" -ForegroundColor Gray
}

Write-Host "`n2️⃣ Test endpoint stock-disponible..." -ForegroundColor White
try {
    $stockResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/stock-disponible" -Method GET
    
    Write-Host "✅ Stock endpoint OK" -ForegroundColor Green
    Write-Host "Stock: $($stockResponse | ConvertTo-Json -Compress)" -ForegroundColor White
    
} catch {
    Write-Host "⚠️ Stock endpoint erreur (peut être normal)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Résultat attendu:" -ForegroundColor Cyan
Write-Host "- Pas d'erreur UnknownPathException" -ForegroundColor Gray
Write-Host "- Status 200 avec liste (vide ou avec données)" -ForegroundColor Gray
Write-Host "- Hibernate utilise correctement p.produit.id" -ForegroundColor Gray