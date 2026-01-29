#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory=$true)]
    [string]$VendorUserId,
    [Parameter(Mandatory=$true)]
    [string]$ProduitId
)

$baseUrl = "http://localhost:8080"

Write-Host "🔍 DIAGNOSTIC ENDPOINT VARIANTES" -ForegroundColor Cyan
Write-Host "Vendor ID: $VendorUserId" -ForegroundColor Yellow
Write-Host "Produit ID: $ProduitId" -ForegroundColor Yellow

# Headers
$headers = @{
    "X-User-Id" = $VendorUserId
    "Content-Type" = "application/json"
}

Write-Host "`n1️⃣ Test validation UUID..." -ForegroundColor White
try {
    [System.Guid]::Parse($ProduitId) | Out-Null
    Write-Host "✅ UUID valide" -ForegroundColor Green
} catch {
    Write-Host "❌ UUID invalide!" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Test endpoint variantes..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    
    Write-Host "✅ Succès!" -ForegroundColor Green
    Write-Host "Nombre de variantes: $($response.Count)" -ForegroundColor White
    
    if ($response.Count -gt 0) {
        Write-Host "Première variante:" -ForegroundColor Gray
        $response[0] | ConvertTo-Json -Depth 2
    } else {
        Write-Host "Aucune variante trouvée (normal pour un nouveau produit)" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = ""
    
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
    } catch {}
    
    Write-Host "❌ Erreur $statusCode" -ForegroundColor Red
    
    switch ($statusCode) {
        400 { 
            Write-Host "🚨 ERREUR 400 - Validation ou permissions" -ForegroundColor Red
            Write-Host "Détails: $errorBody" -ForegroundColor Gray
        }
        404 { 
            Write-Host "❌ Produit non trouvé" -ForegroundColor Red 
        }
        401 { 
            Write-Host "🔒 Non autorisé - Vérifier X-User-Id" -ForegroundColor Red 
        }
        500 { 
            Write-Host "💥 Erreur serveur" -ForegroundColor Red 
        }
        default { 
            Write-Host "❓ Erreur inconnue" -ForegroundColor Red 
        }
    }
    
    Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n3️⃣ Test endpoint stock-disponible..." -ForegroundColor White
try {
    $stockResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/stock-disponible" -Method GET
    
    Write-Host "✅ Stock endpoint OK" -ForegroundColor Green
    Write-Host "Stock Global: $($stockResponse.stockGlobal)" -ForegroundColor White
    Write-Host "Stock Variantes: $($stockResponse.stockVariantesTotal)" -ForegroundColor White
    Write-Host "Stock Disponible: $($stockResponse.stockDisponible)" -ForegroundColor White
    
} catch {
    Write-Host "⚠️ Endpoint stock non disponible" -ForegroundColor Yellow
}

Write-Host "`n🔗 Endpoints testés:" -ForegroundColor Cyan
Write-Host "- GET /api/vendeur/produits/{id}/variantes" -ForegroundColor Gray
Write-Host "- GET /api/vendeur/produits/{id}/stock-disponible" -ForegroundColor Gray