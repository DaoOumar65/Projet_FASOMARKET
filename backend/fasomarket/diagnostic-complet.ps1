# Script de diagnostic complet
$baseUrl = "http://localhost:8081"

Write-Host "=== DIAGNOSTIC COMPLET ===" -ForegroundColor Cyan

# Test 1: Vérifier la connectivité
Write-Host "`n1. Test de connectivité..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/test-connexion" -Method GET
    Write-Host "✅ Serveur accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur non accessible" -ForegroundColor Red
    exit 1
}

# Test 2: Lister tous les produits publics pour voir s'il y en a
Write-Host "`n2. Test des produits publics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/produits/actifs" -Method GET
    Write-Host "✅ Produits publics: $($response.Count) trouvés" -ForegroundColor Green
    if ($response.Count -gt 0) {
        Write-Host "Premier produit ID: $($response[0].id)" -ForegroundColor Cyan
        $firstProductId = $response[0].id
        
        # Test 3: Essayer de récupérer ce produit via l'endpoint vendeur
        Write-Host "`n3. Test avec un produit existant..." -ForegroundColor Yellow
        $headers = @{
            "X-User-Id" = "12345678-1234-1234-1234-123456789012"
            "Content-Type" = "application/json"
        }
        
        try {
            $produitResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendeur/produits/$firstProductId" -Method GET -Headers $headers
            Write-Host "✅ Produit récupéré via endpoint vendeur" -ForegroundColor Green
            Write-Host ($produitResponse | ConvertTo-Json -Depth 2)
        } catch {
            Write-Host "❌ Erreur endpoint vendeur: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Détails: $responseBody" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "❌ Erreur produits publics: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier l'ID spécifique qui pose problème
Write-Host "`n4. Test de l'ID problématique..." -ForegroundColor Yellow
$problematicId = "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/produits/$problematicId" -Method GET
    Write-Host "✅ Produit trouvé via endpoint public" -ForegroundColor Green
} catch {
    Write-Host "❌ Produit non trouvé via endpoint public" -ForegroundColor Red
    Write-Host "Ce produit n'existe probablement pas dans la base de données" -ForegroundColor Yellow
}

Write-Host "`n=== FIN DU DIAGNOSTIC ===" -ForegroundColor Cyan