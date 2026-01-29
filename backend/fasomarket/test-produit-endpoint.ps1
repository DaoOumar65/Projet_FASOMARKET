# Test de l'endpoint produit vendeur
$baseUrl = "http://localhost:8081"
$produitId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"

# Test 1: Vérifier si l'application est démarrée
Write-Host "=== TEST 1: Vérification du serveur ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/test-connexion" -Method GET
    Write-Host "✅ Serveur accessible" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Serveur non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Récupérer le produit avec un vendeur ID fictif
Write-Host "`n=== TEST 2: Récupération produit avec vendeur ID ===" -ForegroundColor Yellow
$headers = @{
    "X-User-Id" = "12345678-1234-1234-1234-123456789012"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$produitId" -Method GET -Headers $headers
    Write-Host "✅ Produit récupéré avec succès" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Erreur récupération produit: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Lister tous les produits d'un vendeur
Write-Host "`n=== TEST 3: Liste des produits vendeur ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits" -Method GET -Headers $headers
    Write-Host "✅ Liste des produits récupérée" -ForegroundColor Green
    Write-Host "Nombre de produits: $($response.Count)"
} catch {
    Write-Host "❌ Erreur liste produits: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIN DES TESTS ===" -ForegroundColor Cyan