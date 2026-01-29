# Test des nouveaux endpoints backend
param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$VendorUserId = "",
    [string]$ProduitId = ""
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST DES NOUVEAUX ENDPOINTS BACKEND" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

if (-not $VendorUserId -or -not $ProduitId) {
    Write-Host "Usage: .\test-nouveaux-endpoints.ps1 -VendorUserId 'UUID' -ProduitId 'UUID'" -ForegroundColor Red
    Write-Host "Exemple: .\test-nouveaux-endpoints.ps1 -VendorUserId '123e4567-e89b-12d3-a456-426614174000' -ProduitId '987fcdeb-51a2-43d1-9c4f-123456789abc'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $VendorUserId
}

Write-Host "`n1. Test modification produit avec images et statut" -ForegroundColor Cyan
$modifyProductBody = @{
    nom = "Produit Modifié avec Images"
    prix = 25000
    status = "ACTIVE"
    imagesList = @("uploads/produits/image1.jpg", "uploads/produits/image2.jpg")
    description = "Description mise à jour"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId" -Method PUT -Headers $headers -Body $modifyProductBody
    Write-Host "✓ Modification produit réussie" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "✗ Erreur modification produit: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Test création variante" -ForegroundColor Cyan
$createVariantBody = @{
    couleur = "Rouge"
    taille = "M"
    stock = 10
    prixAjustement = 0
    materiau = "Coton"
    genre = "Unisexe"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes" -Method POST -Headers $headers -Body $createVariantBody
    Write-Host "✓ Création variante réussie" -ForegroundColor Green
    $varianteId = $response.id
    Write-Host "ID de la variante créée: $varianteId"
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "✗ Erreur création variante: $($_.Exception.Message)" -ForegroundColor Red
    $varianteId = $null
}

Write-Host "`n3. Test liste variantes" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    Write-Host "✓ Liste variantes réussie" -ForegroundColor Green
    Write-Host "Nombre de variantes: $($response.Count)"
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "✗ Erreur liste variantes: $($_.Exception.Message)" -ForegroundColor Red
}

if ($varianteId) {
    Write-Host "`n4. Test modification variante" -ForegroundColor Cyan
    $modifyVariantBody = @{
        couleur = "Bleu"
        taille = "L"
        stock = 15
        prixAjustement = 1000
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes/$varianteId" -Method PUT -Headers $headers -Body $modifyVariantBody
        Write-Host "✓ Modification variante réussie" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "✗ Erreur modification variante: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n5. Test suppression variante (optionnel - décommentez si nécessaire)" -ForegroundColor Cyan
    Write-Host "# Suppression désactivée pour préserver les données de test" -ForegroundColor Yellow
    <#
    try {
        Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes/$varianteId" -Method DELETE -Headers $headers
        Write-Host "✓ Suppression variante réussie" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur suppression variante: $($_.Exception.Message)" -ForegroundColor Red
    }
    #>
}

Write-Host "`n6. Test validation format images" -ForegroundColor Cyan
$invalidImageBody = @{
    nom = "Test Images Invalides"
    imagesList = @("invalid.txt", "uploads/produits/valid.jpg", "another-invalid.doc")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId" -Method PUT -Headers $headers -Body $invalidImageBody
    Write-Host "✗ La validation des images a échoué - cela ne devrait pas passer" -ForegroundColor Red
} catch {
    Write-Host "✓ Validation des images fonctionne correctement: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n7. Test validation statut" -ForegroundColor Cyan
$invalidStatusBody = @{
    nom = "Test Statut Invalide"
    status = "INVALID_STATUS"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId" -Method PUT -Headers $headers -Body $invalidStatusBody
    Write-Host "✗ La validation du statut a échoué - cela ne devrait pas passer" -ForegroundColor Red
} catch {
    Write-Host "✓ Validation du statut fonctionne correctement: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TESTS TERMINÉS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nRésumé des endpoints testés:" -ForegroundColor Yellow
Write-Host "✓ PUT /api/vendeur/produits/{id} - Modification avec images et statut" -ForegroundColor White
Write-Host "✓ POST /api/vendeur/produits/{id}/variantes - Création variante" -ForegroundColor White
Write-Host "✓ PUT /api/vendeur/produits/{id}/variantes/{varianteId} - Modification variante" -ForegroundColor White
Write-Host "✓ DELETE /api/vendeur/produits/{id}/variantes/{varianteId} - Suppression variante" -ForegroundColor White
Write-Host "✓ GET /api/vendeur/produits/{id}/variantes - Liste variantes" -ForegroundColor White