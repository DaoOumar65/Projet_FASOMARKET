# 🔧 ENDPOINTS BACKEND MANQUANTS - GESTION STOCKS

## 📍 Endpoint principal manquant

### GET /api/vendeur/produits/{id}/stock-disponible

```java
@RestController
@RequestMapping("/api/vendeur")
public class VendeurStockController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductVariantService variantService;
    
    @GetMapping("/produits/{id}/stock-disponible")
    public ResponseEntity<StockInfoResponse> getStockDisponible(@PathVariable String id) {
        try {
            Product product = productService.findById(id);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<ProductVariant> variants = variantService.findByProductId(id);
            
            int stockVariantesTotal = variants.stream()
                .mapToInt(ProductVariant::getStock)
                .sum();
            
            int stockDisponible = product.getStock() - stockVariantesTotal;
            
            StockInfoResponse response = new StockInfoResponse(
                product.getStock(),
                stockVariantesTotal,
                stockDisponible
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
```

## 📊 DTO Response

```java
public class StockInfoResponse {
    private int stockGlobal;
    private int stockVariantesTotal;
    private int stockDisponible;
    
    public StockInfoResponse() {}
    
    public StockInfoResponse(int stockGlobal, int stockVariantesTotal, int stockDisponible) {
        this.stockGlobal = stockGlobal;
        this.stockVariantesTotal = stockVariantesTotal;
        this.stockDisponible = stockDisponible;
    }
    
    // Getters et Setters
    public int getStockGlobal() { return stockGlobal; }
    public void setStockGlobal(int stockGlobal) { this.stockGlobal = stockGlobal; }
    
    public int getStockVariantesTotal() { return stockVariantesTotal; }
    public void setStockVariantesTotal(int stockVariantesTotal) { this.stockVariantesTotal = stockVariantesTotal; }
    
    public int getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(int stockDisponible) { this.stockDisponible = stockDisponible; }
}
```

## 🔄 Modification endpoint variantes

### PUT /api/vendeur/produits/{id}/variantes/{varianteId}

```java
@PutMapping("/produits/{id}/variantes/{varianteId}")
public ResponseEntity<?> updateVariante(
    @PathVariable String id, 
    @PathVariable Long varianteId,
    @RequestBody UpdateVariantRequest request
) {
    try {
        Product product = productService.findById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<ProductVariant> variants = variantService.findByProductId(id);
        
        // Calculer stock autres variantes
        int stockAutresVariantes = variants.stream()
            .filter(v -> !v.getId().equals(varianteId))
            .mapToInt(ProductVariant::getStock)
            .sum();
        
        int nouveauTotal = stockAutresVariantes + request.getStock();
        
        if (nouveauTotal > product.getStock()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Stock insuffisant", 
                           "stockDisponible", product.getStock() - stockAutresVariantes));
        }
        
        // Mettre à jour la variante
        ProductVariant variant = variantService.findById(varianteId);
        if (variant == null) {
            return ResponseEntity.notFound().build();
        }
        
        variant.setStock(request.getStock());
        if (request.getCouleur() != null) variant.setCouleur(request.getCouleur());
        if (request.getTaille() != null) variant.setTaille(request.getTaille());
        if (request.getModele() != null) variant.setModele(request.getModele());
        if (request.getPrixAjustement() != null) variant.setPrixAjustement(request.getPrixAjustement());
        
        variantService.save(variant);
        
        return ResponseEntity.ok(variant);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
```

## 📝 DTO Request

```java
public class UpdateVariantRequest {
    private Integer stock;
    private String couleur;
    private String taille;
    private String modele;
    private Double prixAjustement;
    
    // Getters et Setters
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }
    
    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }
    
    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }
    
    public Double getPrixAjustement() { return prixAjustement; }
    public void setPrixAjustement(Double prixAjustement) { this.prixAjustement = prixAjustement; }
}
```

## 🗄️ Entité ProductVariant

```java
@Entity
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "product_id", nullable = false)
    private String productId;
    
    @Column(name = "couleur")
    private String couleur;
    
    @Column(name = "taille")
    private String taille;
    
    @Column(name = "modele")
    private String modele;
    
    @Column(name = "prix_ajustement", nullable = false)
    private Double prixAjustement = 0.0;
    
    @Column(name = "stock", nullable = false)
    private Integer stock = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters et Setters complets
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    
    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }
    
    public String getTaille() { return taille; }
    public void setTaille(String taille) { this.taille = taille; }
    
    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }
    
    public Double getPrixAjustement() { return prixAjustement; }
    public void setPrixAjustement(Double prixAjustement) { this.prixAjustement = prixAjustement; }
    
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

## 🔍 Service ProductVariantService

```java
@Service
public class ProductVariantService {
    
    @Autowired
    private ProductVariantRepository repository;
    
    public List<ProductVariant> findByProductId(String productId) {
        return repository.findByProductId(productId);
    }
    
    public ProductVariant findById(Long id) {
        return repository.findById(id).orElse(null);
    }
    
    public ProductVariant save(ProductVariant variant) {
        return repository.save(variant);
    }
    
    public void delete(ProductVariant variant) {
        repository.delete(variant);
    }
}
```

## 📋 Repository

```java
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(String productId);
    
    @Query("SELECT SUM(v.stock) FROM ProductVariant v WHERE v.productId = :productId")
    Integer getTotalStockByProductId(@Param("productId") String productId);
}
```

## ⚠️ Points critiques à implémenter

1. **Endpoint manquant** : `/api/vendeur/produits/{id}/stock-disponible`
2. **Validation stock** : Empêcher dépassement stock global
3. **Entité ProductVariant** : Avec champs stock, couleur, taille, modele
4. **Service complet** : CRUD variantes avec validation
5. **Repository** : Requêtes par productId
6. **DTOs** : StockInfoResponse et UpdateVariantRequest