# Test de l'endpoint de debug
$baseUrl = "http://localhost:8081"
$produitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"

Write-Host "=== TEST DEBUG PRODUIT ===" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$produitId/debug" -Method GET
    Write-Host "✅ Debug réussi" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "❌ Erreur debug: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}