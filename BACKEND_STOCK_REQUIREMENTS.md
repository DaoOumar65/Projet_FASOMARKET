# 📦 BACKEND - LOGIQUE DE GESTION DES STOCKS

## 🎯 Logique métier implémentée

### Stock Global vs Stock Variantes
- **Stock Global** = Stock total du produit (ex: 50 chaussures)
- **Stock Variantes** = Répartition du stock global (ex: Rouge:20, Noir:15, Blanc:15)
- **Contrainte** : Σ(stocks variantes) ≤ Stock Global
- **🚫 Variantes épuisées** : Stock = 0 → **MASQUÉES** (recommandé) ou désactivées

### Gestion des variantes épuisées
**Option recommandée : MASQUER les variantes épuisées**
- ✅ Meilleure UX : Client ne voit que les options disponibles
- ✅ Évite la frustration : Pas de sélection impossible
- ✅ Interface propre : Moins d'encombrement visuel
- ✅ Conversion optimisée : Focus sur les options achetables

## 🔧 Backend Requirements

### 1. Validation lors de la création/modification

```java
// ProductService.java
public void validateStockVariantes(Product product, List<ProductVariant> variants) {
    int stockGlobal = product.getStock();
    int stockVariantesTotal = variants.stream()
        .mapToInt(ProductVariant::getStock)
        .sum();
    
    if (stockVariantesTotal > stockGlobal) {
        throw new ValidationException(
            "Stock des variantes (" + stockVariantesTotal + 
            ") dépasse le stock global (" + stockGlobal + ")"
        );
    }
}
```

### 2. Endpoints à modifier

#### POST /api/vendeur/produits/creer
```java
@PostMapping("/creer")
public ResponseEntity<?> creerProduit(@RequestBody CreateProductRequest request) {
    // Valider stock global vs variantes
    validateStockVariantes(request.getProduct(), request.getVariantes());
    
    // Créer produit + variantes
    Product product = productService.createProduct(request);
    return ResponseEntity.ok(product);
}
```

#### PUT /api/vendeur/produits/{id}/variantes/{varianteId}
```java
@PutMapping("/{id}/variantes/{varianteId}")
public ResponseEntity<?> updateVariante(
    @PathVariable String id, 
    @PathVariable Long varianteId,
    @RequestBody UpdateVariantRequest request
) {
    // Récupérer produit et variantes existantes
    Product product = productService.findById(id);
    List<ProductVariant> variants = variantService.findByProductId(id);
    
    // Calculer nouveau total avec modification
    int stockAutresVariantes = variants.stream()
        .filter(v -> !v.getId().equals(varianteId))
        .mapToInt(ProductVariant::getStock)
        .sum();
    
    int nouveauTotal = stockAutresVariantes + request.getStock();
    
    if (nouveauTotal > product.getStock()) {
        throw new ValidationException("Stock insuffisant");
    }
    
    // Mettre à jour
    variantService.updateVariant(varianteId, request);
    return ResponseEntity.ok().build();
}
```

### 3. Gestion des ventes

#### Décrémenter les stocks lors d'une vente
```java
// OrderService.java
public void processOrder(Order order) {
    for (OrderItem item : order.getItems()) {
        if (item.getVariantId() != null) {
            // Vente d'une variante spécifique
            ProductVariant variant = variantService.findById(item.getVariantId());
            Product product = productService.findById(variant.getProductId());
            
            // Vérifier stock variante
            if (variant.getStock() < item.getQuantity()) {
                throw new InsufficientStockException("Stock variante insuffisant");
            }
            
            // Décrémenter les deux stocks
            variant.setStock(variant.getStock() - item.getQuantity());
            product.setStock(product.getStock() - item.getQuantity());
            
            variantService.save(variant);
            productService.save(product);
        } else {
            // Vente du produit général (sans variante)
            Product product = productService.findById(item.getProductId());
            
            if (product.getStock() < item.getQuantity()) {
                throw new InsufficientStockException("Stock produit insuffisant");
            }
            
            product.setStock(product.getStock() - item.getQuantity());
            productService.save(product);
        }
    }
}
```

### 4. Filtrage des variantes épuisées

#### GET /api/public/produits/{id}/variantes (Client)
```java
@GetMapping("/{id}/variantes")
public ResponseEntity<List<ProductVariant>> getVariantesDisponibles(@PathVariable String id) {
    List<ProductVariant> variants = variantService.findByProductId(id);
    
    // FILTRER les variantes épuisées pour les clients
    List<ProductVariant> variantesDisponibles = variants.stream()
        .filter(v -> v.getStock() > 0)
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(variantesDisponibles);
}
```

#### GET /api/vendeur/produits/{id}/variantes (Vendeur)
```java
@GetMapping("/{id}/variantes")
public ResponseEntity<List<ProductVariant>> getVariantesVendeur(@PathVariable String id) {
    // Vendeur voit TOUTES les variantes (même épuisées)
    List<ProductVariant> variants = variantService.findByProductId(id);
    return ResponseEntity.ok(variants);
}
```

### 5. Endpoints de validation

#### GET /api/vendeur/produits/{id}/stock-disponible
```java
@GetMapping("/{id}/stock-disponible")
public ResponseEntity<StockInfoResponse> getStockDisponible(@PathVariable String id) {
    Product product = productService.findById(id);
    List<ProductVariant> variants = variantService.findByProductId(id);
    
    int stockVariantesTotal = variants.stream()
        .mapToInt(ProductVariant::getStock)
        .sum();
    
    int stockDisponible = product.getStock() - stockVariantesTotal;
    
    return ResponseEntity.ok(new StockInfoResponse(
        product.getStock(),
        stockVariantesTotal,
        stockDisponible
    ));
}
```

### 6. DTOs requis

```java
// StockInfoResponse.java
public class StockInfoResponse {
    private int stockGlobal;
    private int stockVariantesTotal;
    private int stockDisponible;
    
    // constructors, getters, setters
}

// CreateProductRequest.java
public class CreateProductRequest {
    private Product product;
    private List<ProductVariant> variantes;
    
    // Validation automatique
    @AssertTrue(message = "Stock des variantes dépasse le stock global")
    public boolean isStockValid() {
        if (variantes == null || variantes.isEmpty()) return true;
        
        int stockVariantes = variantes.stream()
            .mapToInt(ProductVariant::getStock)
            .sum();
        
        return stockVariantes <= product.getStock();
    }
}
```

### 7. Règles de visibilité produit

```java
// ProductService.java
public boolean isProduitVisible(Product product) {
    if (!"ACTIVE".equals(product.getStatus())) {
        return false;
    }
    
    List<ProductVariant> variants = variantService.findByProductId(product.getId());
    
    if (variants.isEmpty()) {
        return product.getStock() > 0;
    } else {
        return variants.stream().anyMatch(v -> v.getStock() > 0);
    }
}
```

### 8. Base de données

#### Contrainte CHECK (optionnel)
```sql
-- Ajouter une contrainte au niveau base de données
ALTER TABLE products ADD CONSTRAINT check_stock_variants 
CHECK (
    stock >= (
        SELECT COALESCE(SUM(stock), 0) 
        FROM product_variants 
        WHERE product_id = products.id
    )
);
```

## 🚀 Fonctionnalités implémentées côté Frontend

✅ **Validation temps réel** : Stock restant affiché en temps réel  
✅ **Prévention saisie** : Impossible de saisir plus que le stock disponible  
✅ **Messages d'erreur** : Alertes claires en cas de dépassement  
✅ **Interface intuitive** : Indicateur visuel du stock restant  
✅ **Modification sécurisée** : Validation lors de la modification des variantes  
✅ **Filtrage intelligent** : Variantes épuisées masquées côté client  
✅ **Interface vendeur complète** : Toutes variantes visibles avec statut  
✅ **Badges de stock** : Indicateurs visuels (En stock/Épuisé)  
✅ **Produit auto-masqué** : Si toutes variantes épuisées → produit invisible  

## 🔄 Flux de validation

1. **Création produit** : Stock global défini (ex: 50)
2. **Ajout variantes** : Validation ≤ stock global
3. **Modification variantes** : Recalcul automatique du stock disponible
4. **Vente** : Décrémenter stock global ET stock variante
5. **Réapprovisionnement** : Augmenter stock global, répartir sur variantes
6. **Épuisement variante** : Stock = 0 → Masquer côté client, garder côté vendeur
7. **Épuisement total** : Toutes variantes = 0 → Produit invisible publiquement

## 🎯 Exemple concret

```
Produit: Chaussures Nike (Stock global: 50, Statut: ACTIVE)
├── Rouge T42: 20 ← ✅ Visible client
├── Noir T40: 0  ← ❌ Masqué client (vendeur voit "Épuisé")
├── Blanc T38: 15 ← ✅ Visible client
└── Produit visible car au moins 1 variante en stock

Produit: T-shirt Adidas (Stock global: 0, Statut: ACTIVE)
├── Rouge M: 0   ← ❌ Toutes épuisées
├── Bleu L: 0    ← ❌ Toutes épuisées
└── Produit MASQUÉ automatiquement
```

Cette logique garantit la cohérence des stocks et évite les surventes.