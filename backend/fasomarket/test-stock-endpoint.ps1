#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory=$true)]
    [string]$ProduitId
)

$baseUrl = "http://localhost:8080"

Write-Host "🧪 Test de l'endpoint stock-disponible" -ForegroundColor Cyan
Write-Host "Produit ID: $ProduitId" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/stock-disponible" -Method GET -ContentType "application/json"
    
    Write-Host "✅ Succès!" -ForegroundColor Green
    Write-Host "Stock Global: $($response.stockGlobal)" -ForegroundColor White
    Write-Host "Stock Variantes Total: $($response.stockVariantesTotal)" -ForegroundColor White
    Write-Host "Stock Disponible: $($response.stockDisponible)" -ForegroundColor White
    Write-Host "Stock Valide: $($response.stockValide)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Erreur $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 400) {
        Write-Host "⚠️ Erreur 400 - Calcul côté client recommandé" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ Produit non trouvé" -ForegroundColor Red
    } else {
        Write-Host "❌ Erreur totale - Valeurs par défaut retournées" -ForegroundColor Red
    }
    
    Write-Host "Réponse d'erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n🔗 Endpoint testé: GET /api/vendeur/produits/{id}/stock-disponible" -ForegroundColor Cyan