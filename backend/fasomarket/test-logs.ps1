# Test simple pour déclencher l'erreur
$baseUrl = "http://localhost:8081"
$produitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
$vendorId = "12345678-1234-1234-1234-123456789012"

Write-Host "Test de l'endpoint avec logs détaillés..." -ForegroundColor Yellow

$headers = @{
    "X-User-Id" = $vendorId
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$produitId" -Method GET -Headers $headers
    Write-Host "✅ Succès inattendu!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 2)
} catch {
    Write-Host "❌ Erreur 500 comme attendu" -ForegroundColor Red
    Write-Host "Vérifiez maintenant les logs de l'application pour voir l'exception exacte..." -ForegroundColor Cyan
}