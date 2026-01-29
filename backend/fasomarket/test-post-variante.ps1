#!/usr/bin/env pwsh

param(
    [string]$VendorUserId = "615c948e-cb64-4eae-9c35-c45283a1ce16",
    [string]$ProduitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
)

$baseUrl = "http://localhost:8081"

Write-Host "🧪 TEST POST VARIANTE - Correction Hibernate" -ForegroundColor Red
Write-Host "Endpoint: POST /api/vendeur/produits/$ProduitId/variantes" -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = $VendorUserId
    "Content-Type" = "application/json"
}

$varianteData = @{
    couleur = "Rouge Test"
    taille = "M"
    stock = 5
    prixAjustement = 0
    materiau = "Coton"
    genre = "Unisexe"
} | ConvertTo-Json

Write-Host "`nDonnées à envoyer:" -ForegroundColor Gray
Write-Host $varianteData -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$ProduitId/variantes" -Method POST -Headers $headers -Body $varianteData
    
    Write-Host "✅ SUCCÈS! POST variante fonctionne" -ForegroundColor Green
    Write-Host "Status: 200 OK" -ForegroundColor Green
    Write-Host "Réponse:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 2
    
    Write-Host "`n✅ Hibernate OK - Pas d'erreur UnknownPathException" -ForegroundColor Green
    
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
        Write-Host "L'attribut 'produitId' cause encore des problèmes" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Hibernate OK - Autre type d'erreur" -ForegroundColor Green
    }
    
    Write-Host "Détails erreur: $errorBody" -ForegroundColor Gray
}

Write-Host "`n🎯 Objectif: Status 200 avec variante créée" -ForegroundColor Cyan