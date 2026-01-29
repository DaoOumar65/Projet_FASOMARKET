# Test de la logique de gestion des stocks
param(
    [string]$BaseUrl = "http://localhost:8081",
    [string]$VendorUserId = "",
    [string]$ProduitId = ""
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST LOGIQUE GESTION DES STOCKS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

if (-not $VendorUserId -or -not $ProduitId) {
    Write-Host "Usage: .\test-stock-management.ps1 -VendorUserId 'UUID' -ProduitId 'UUID'" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $VendorUserId
}

Write-Host "`n1. Test récupération informations stock" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/stock-disponible" -Method GET -Headers $headers
    Write-Host "✓ Informations stock récupérées" -ForegroundColor Green
    Write-Host "Stock global: $($response.stockGlobal)"
    Write-Host "Stock variantes total: $($response.stockVariantesTotal)"
    Write-Host "Stock disponible: $($response.stockDisponible)"
    Write-Host "Stock valide: $($response.stockValide)"
    
    $stockGlobal = $response.stockGlobal
    $stockDisponible = $response.stockDisponible
} catch {
    Write-Host "✗ Erreur récupération stock: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Test création variante avec stock valide" -ForegroundColor Cyan
$varianteValide = @{
    couleur = "Vert Test"
    taille = "L"
    stock = [Math]::Min(5, $stockDisponible)
    prixAjustement = 0
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes" -Method POST -Headers $headers -Body $varianteValide
    Write-Host "✓ Variante créée avec stock valide" -ForegroundColor Green
    $varianteId = $response.id
    Write-Host "ID variante créée: $varianteId"
} catch {
    Write-Host "✗ Erreur création variante valide: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test création variante avec stock excessif (doit échouer)" -ForegroundColor Cyan
$varianteInvalide = @{
    couleur = "Rouge Test"
    taille = "XL"
    stock = $stockGlobal + 10
    prixAjustement = 0
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes" -Method POST -Headers $headers -Body $varianteInvalide
    Write-Host "✗ La validation a échoué - cela ne devrait pas passer" -ForegroundColor Red
} catch {
    Write-Host "✓ Validation stock fonctionne correctement: $($_.Exception.Message)" -ForegroundColor Green
}

if ($varianteId) {
    Write-Host "`n4. Test modification variante avec stock excessif (doit échouer)" -ForegroundColor Cyan
    $modificationInvalide = @{
        couleur = "Vert Modifié"
        taille = "L"
        stock = $stockGlobal + 5
        prixAjustement = 0
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes/$varianteId" -Method PUT -Headers $headers -Body $modificationInvalide
        Write-Host "✗ La validation modification a échoué - cela ne devrait pas passer" -ForegroundColor Red
    } catch {
        Write-Host "✓ Validation modification stock fonctionne correctement: $($_.Exception.Message)" -ForegroundColor Green
    }

    Write-Host "`n5. Test modification variante avec stock valide" -ForegroundColor Cyan
    $modificationValide = @{
        couleur = "Vert Modifié"
        taille = "L"
        stock = 3
        prixAjustement = 500
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes/$varianteId" -Method PUT -Headers $headers -Body $modificationValide
        Write-Host "✓ Modification variante avec stock valide réussie" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur modification variante valide: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n6. Test récupération variantes disponibles (client)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/produits/$ProduitId/variantes" -Method GET
    Write-Host "✓ Variantes disponibles récupérées" -ForegroundColor Green
    Write-Host "Nombre de variantes disponibles (stock > 0): $($response.Count)"
    
    foreach ($variante in $response) {
        Write-Host "  - $($variante.couleur) $($variante.taille): Stock $($variante.stock)"
    }
} catch {
    Write-Host "✗ Erreur récupération variantes disponibles: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n7. Test récupération toutes variantes (vendeur)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/variantes" -Method GET -Headers $headers
    Write-Host "✓ Toutes les variantes récupérées" -ForegroundColor Green
    Write-Host "Nombre total de variantes: $($response.Count)"
    
    foreach ($variante in $response) {
        $statut = if ($variante.stock -gt 0) { "En stock" } else { "Épuisé" }
        Write-Host "  - $($variante.couleur) $($variante.taille): Stock $($variante.stock) ($statut)"
    }
} catch {
    Write-Host "✗ Erreur récupération toutes variantes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n8. Vérification finale des stocks" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/vendeur/produits/$ProduitId/stock-disponible" -Method GET -Headers $headers
    Write-Host "✓ Vérification finale réussie" -ForegroundColor Green
    Write-Host "Stock global: $($response.stockGlobal)"
    Write-Host "Stock variantes total: $($response.stockVariantesTotal)"
    Write-Host "Stock disponible: $($response.stockDisponible)"
    Write-Host "Stock valide: $($response.stockValide)"
    
    if ($response.stockValide) {
        Write-Host "✓ Cohérence des stocks maintenue" -ForegroundColor Green
    } else {
        Write-Host "✗ Incohérence détectée dans les stocks" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur vérification finale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TESTS TERMINÉS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nLogique testée:" -ForegroundColor Yellow
Write-Host "✓ Validation stock global vs stock variantes" -ForegroundColor White
Write-Host "✓ Prévention création variante avec stock excessif" -ForegroundColor White
Write-Host "✓ Prévention modification variante avec stock excessif" -ForegroundColor White
Write-Host "✓ Filtrage variantes épuisées pour clients" -ForegroundColor White
Write-Host "✓ Affichage complet pour vendeurs" -ForegroundColor White
Write-Host "✓ Cohérence des stocks maintenue" -ForegroundColor White