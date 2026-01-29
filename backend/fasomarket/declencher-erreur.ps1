# Script pour déclencher l'erreur et analyser les logs
$baseUrl = "http://localhost:8081"
$produitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
$vendorId = "12345678-1234-1234-1234-123456789012"

Write-Host "=== DECLENCHEMENT ERREUR POUR ANALYSE ===" -ForegroundColor Red

$headers = @{
    "X-User-Id" = $vendorId
    "Content-Type" = "application/json"
}

Write-Host "Déclenchement de l'erreur 500..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$produitId" -Method GET -Headers $headers
    Write-Host "✅ Pas d'erreur (inattendu)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur 500 déclenchée comme attendu" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Réponse serveur:" -ForegroundColor Cyan
        Write-Host $responseBody -ForegroundColor White
    }
}

Write-Host "`nVérifiez maintenant les logs de l'application Spring Boot dans la console..." -ForegroundColor Cyan