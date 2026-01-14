# Test système de catégories dynamiques
# Exécuter avec: .\test-categories.ps1

$baseUrl = "http://localhost:8081/api"

Write-Host "📂 Test Système de Catégories Dynamiques" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Créer des catégories
Write-Host "`n📋 1. Création de catégories" -ForegroundColor Yellow

$categories = @(
    @{ nom = "Électronique"; description = "Appareils électroniques et gadgets"; icone = "electronics" },
    @{ nom = "Alimentaire"; description = "Produits alimentaires et boissons"; icone = "food" },
    @{ nom = "Vêtements"; description = "Habits et accessoires de mode"; icone = "clothing" },
    @{ nom = "Maison & Jardin"; description = "Articles pour la maison et le jardin"; icone = "home" }
)

$categoriesCreees = @()

foreach ($cat in $categories) {
    $catData = $cat | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/categories/creer" -Method Post -Body $catData -ContentType "application/json"
        Write-Host "✅ Catégorie créée: $($response.nom)" -ForegroundColor Green
        $categoriesCreees += $response
    } catch {
        Write-Host "❌ Erreur catégorie $($cat.nom): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Lister les catégories
Write-Host "`n📋 2. Liste des catégories" -ForegroundColor Yellow
try {
    $listeCategories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    Write-Host "✅ Nombre de catégories: $($listeCategories.Count)" -ForegroundColor Green
    foreach ($cat in $listeCategories) {
        Write-Host "   - $($cat.nom): $($cat.nombreBoutiques) boutiques, $($cat.nombreProduits) produits" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erreur liste catégories: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Créer un vendeur et une boutique avec catégorie
Write-Host "`n📋 3. Boutique avec catégorie" -ForegroundColor Yellow
$vendorData = @{
    nomComplet = "Tech Vendeur"
    telephone = "+22670999999"
    email = "tech@vendeur.com"
    motDePasse = "password123"
    carteIdentite = "CI444555666"
} | ConvertTo-Json

$vendorResponse = Invoke-RestMethod -Uri "$baseUrl/auth/inscription-vendeur" -Method Post -Body $vendorData -ContentType "application/json"
$vendorId = $vendorResponse.userId

$boutiqueData = @{
    nom = "TechStore Catégories"
    description = "Boutique spécialisée en électronique"
    telephone = "+22670999999"
    adresse = "Zone Tech, Ouagadougou"
    categorie = "Électronique"
    email = "contact@techstore.com"
} | ConvertTo-Json

$vendorHeaders = @{ "Content-Type" = "application/json"; "X-User-Id" = $vendorId }
$boutiqueResponse = Invoke-RestMethod -Uri "$baseUrl/boutiques/creer" -Method Post -Body $boutiqueData -Headers $vendorHeaders
Write-Host "✅ Boutique créée: $($boutiqueResponse.nom) - Catégorie: $($boutiqueResponse.categorie)" -ForegroundColor Green

# 4. Créer des produits avec catégories
Write-Host "`n📋 4. Produits avec catégories" -ForegroundColor Yellow
$produits = @(
    @{ nom = "iPhone 15"; categorie = "Électronique"; prix = 800000; stock = 3 },
    @{ nom = "Samsung Galaxy"; categorie = "Électronique"; prix = 600000; stock = 5 },
    @{ nom = "Ordinateur Portable"; categorie = "Électronique"; prix = 450000; stock = 2 }
)

foreach ($prod in $produits) {
    $prodData = @{
        nom = $prod.nom
        description = "Produit de test pour catégorie $($prod.categorie)"
        categorie = $prod.categorie
        prix = $prod.prix
        quantiteStock = $prod.stock
    } | ConvertTo-Json
    
    try {
        $prodResponse = Invoke-RestMethod -Uri "$baseUrl/produits/creer?boutiqueId=$($boutiqueResponse.id)" -Method Post -Body $prodData -Headers $vendorHeaders
        Write-Host "✅ Produit créé: $($prodResponse.nom)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur produit $($prod.nom): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Tester les recherches par catégorie
Write-Host "`n📋 5. Recherches par catégorie" -ForegroundColor Yellow

# Trouver la catégorie Électronique
$categorieElectronique = $listeCategories | Where-Object { $_.nom -eq "Électronique" }

if ($categorieElectronique) {
    try {
        $boutiquesElec = Invoke-RestMethod -Uri "$baseUrl/categories/$($categorieElectronique.id)/boutiques" -Method Get
        Write-Host "✅ Boutiques Électronique: $($boutiquesElec.Count)" -ForegroundColor Green
        
        $produitsElec = Invoke-RestMethod -Uri "$baseUrl/categories/$($categorieElectronique.id)/produits" -Method Get
        Write-Host "✅ Produits Électronique: $($produitsElec.Count)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur recherche catégorie: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Vérifier les catégories mises à jour
Write-Host "`n📋 6. Catégories mises à jour" -ForegroundColor Yellow
try {
    $categoriesFinales = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    foreach ($cat in $categoriesFinales) {
        if ($cat.nombreBoutiques -gt 0 -or $cat.nombreProduits -gt 0) {
            Write-Host "✅ $($cat.nom): $($cat.nombreBoutiques) boutiques, $($cat.nombreProduits) produits" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Erreur vérification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test catégories dynamiques terminé!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8081/swagger-ui.html" -ForegroundColor Cyan