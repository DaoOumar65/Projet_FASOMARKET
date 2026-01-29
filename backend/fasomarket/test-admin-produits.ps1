# Test des fonctionnalités admin pour la gestion des produits
param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AdminUserId = ""
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST FONCTIONNALITÉS ADMIN PRODUITS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

if (-not $AdminUserId) {
    Write-Host "Usage: .\test-admin-produits.ps1 -AdminUserId 'UUID_ADMIN'" -ForegroundColor Red
    Write-Host "Exemple: .\test-admin-produits.ps1 -AdminUserId '123e4567-e89b-12d3-a456-426614174000'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Content-Type" = "application/json"
    "X-User-Id" = $AdminUserId
}

Write-Host "`n1. Test récupération de TOUS les produits" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/produits" -Method GET -Headers $headers
    Write-Host "✓ Récupération réussie" -ForegroundColor Green
    Write-Host "Total produits: $($response.total)"
    Write-Host "Statistiques:"
    Write-Host "  - Actifs: $($response.statistiques.actifs)"
    Write-Host "  - Masqués: $($response.statistiques.masques)"
    Write-Host "  - Bloqués: $($response.statistiques.bloques)"
    
    if ($response.produits.Count -gt 0) {
        $premierProduit = $response.produits[0]
        $produitId = $premierProduit.id
        Write-Host "Premier produit: $($premierProduit.name) - Boutique: $($premierProduit.shopName) - Vendeur: $($premierProduit.vendorName)"
    }
} catch {
    Write-Host "✗ Erreur récupération produits: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Test filtrage par statut - Produits actifs" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/produits?statut=actifs" -Method GET -Headers $headers
    Write-Host "✓ Filtrage actifs réussi" -ForegroundColor Green
    Write-Host "Produits actifs: $($response.total)"
} catch {
    Write-Host "✗ Erreur filtrage actifs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test filtrage par statut - Produits masqués" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/produits?statut=masques" -Method GET -Headers $headers
    Write-Host "✓ Filtrage masqués réussi" -ForegroundColor Green
    Write-Host "Produits masqués: $($response.total)"
} catch {
    Write-Host "✗ Erreur filtrage masqués: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Test recherche par nom" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/produits?recherche=produit" -Method GET -Headers $headers
    Write-Host "✓ Recherche réussie" -ForegroundColor Green
    Write-Host "Résultats trouvés: $($response.total)"
} catch {
    Write-Host "✗ Erreur recherche: $($_.Exception.Message)" -ForegroundColor Red
}

if ($produitId) {
    Write-Host "`n5. Test changement de statut produit - Bloquer" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/produits/$produitId/statut?statut=BLOCKED&commentaire=Test de blocage automatique" -Method PUT -Headers $headers
        Write-Host "✓ Blocage produit réussi" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur blocage produit: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n6. Test changement de statut produit - Débloquer" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/produits/$produitId/statut?statut=ACTIVE&commentaire=Test de déblocage automatique" -Method PUT -Headers $headers
        Write-Host "✓ Déblocage produit réussi" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur déblocage produit: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n7. Test récupération notifications admin" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/notifications" -Method GET -Headers $headers
    Write-Host "✓ Récupération notifications réussie" -ForegroundColor Green
    Write-Host "Nombre de notifications: $($response.Count)"
    
    if ($response.Count -gt 0) {
        $premiereNotif = $response[0]
        Write-Host "Première notification: $($premiereNotif.titre)"
        $notificationId = $premiereNotif.id
    }
} catch {
    Write-Host "✗ Erreur récupération notifications: $($_.Exception.Message)" -ForegroundColor Red
}

if ($notificationId) {
    Write-Host "`n8. Test marquer notification comme lue" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/notifications/$notificationId/lue" -Method PUT -Headers $headers
        Write-Host "✓ Notification marquée comme lue" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur marquage notification: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n9. Test compteur notifications admin" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/admin/notifications/compteur" -Method GET -Headers $headers
    Write-Host "✓ Compteur notifications récupéré" -ForegroundColor Green
    Write-Host "Notifications non lues: $($response.count)"
} catch {
    Write-Host "✗ Erreur compteur notifications: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TESTS TERMINÉS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nRésumé des fonctionnalités testées:" -ForegroundColor Yellow
Write-Host "✓ GET /api/admin/produits - Tous les produits avec statistiques" -ForegroundColor White
Write-Host "✓ GET /api/admin/produits?statut=X - Filtrage par statut" -ForegroundColor White
Write-Host "✓ GET /api/admin/produits?recherche=X - Recherche par nom/boutique/vendeur" -ForegroundColor White
Write-Host "✓ PUT /api/admin/produits/{id}/statut - Bloquer/débloquer avec commentaires" -ForegroundColor White
Write-Host "✓ GET /api/admin/notifications - Notifications admin" -ForegroundColor White
Write-Host "✓ PUT /api/admin/notifications/{id}/lue - Marquer notification lue" -ForegroundColor White
Write-Host "✓ GET /api/admin/notifications/compteur - Compteur notifications" -ForegroundColor White