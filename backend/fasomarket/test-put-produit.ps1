# Test rapide de l'endpoint PUT produit
param(
    [string]$BaseUrl = "http://localhost:8081",
    [string]$VendorUserId = "",
    [string]$ProduitId = ""
)

if (-not $VendorUserId -or -not $ProduitId) {
    Write-Host "Usage: .\test-put-produit.ps1 -VendorUserId 'UUID' -ProduitId 'UUID'" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $VendorUserId
}

Write-Host "Test PUT /api/vendeur/produits/$ProduitId" -ForegroundColor Cyan

$body = @{
    nom = "Produit Test Modifié"
    prix = 15000
    description = "Description mise à jour"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId" -Method PUT -Headers $headers -Body $body
    Write-Host "✓ Modification réussie" -ForegroundColor Green
    Write-Host "Nom: $($response.nom)"
    Write-Host "Prix: $($response.prix)"
} catch {
    Write-Host "✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
}