# Fix Urgent - Endpoints Produits (Erreur 405)

## Problème
- Erreur 405 sur GET `/api/vendeur/produits/{id}` 
- Erreur 405 sur PUT `/api/vendeur/produits/{id}`
- Le changement de statut ne fonctionne pas

## Cause
Le backend n'a probablement pas implémenté ces endpoints ou utilise des méthodes HTTP différentes.

## Solution Backend

### 1. Vérifier le Controller Produits

```java
@RestController
@RequestMapping("/api/vendeur")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VendorProductController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private VendorRepository vendorRepository;
    
    // GET /api/vendeur/produits - Liste des produits
    @GetMapping("/produits")
    public ResponseEntity<List<ProductDTO>> getProduits(@RequestHeader("X-User-Id") UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendeur non trouvé"));
        
        Shop shop = shopRepository.findByVendorId(vendor.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Boutique non trouvée"));
        
        List<Product> products = productRepository.findByShopId(shop.getId());
        List<ProductDTO> dtos = products.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    // GET /api/vendeur/produits/{id} - Détails d'un produit
    @GetMapping("/produits/{id}")
    public ResponseEntity<ProductDTO> getProduit(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé"));
        
        // Vérifier que le produit appartient au vendeur
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendeur non trouvé"));
        
        if (!product.getShop().getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Non autorisé");
        }
        
        return ResponseEntity.ok(convertToDTO(product));
    }
    
    // PUT /api/vendeur/produits/{id} - Modifier un produit
    @PutMapping("/produits/{id}")
    public ResponseEntity<Void> updateProduit(
            @PathVariable UUID id,
            @RequestBody UpdateProductRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé"));
        
        // Vérifier que le produit appartient au vendeur
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendeur non trouvé"));
        
        if (!product.getShop().getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Non autorisé");
        }
        
        // Mettre à jour les champs
        if (request.getNom() != null) {
            product.setName(request.getNom());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrix() != null) {
            product.setPrice(request.getPrix());
        }
        if (request.getStock() != null) {
            product.setStock(request.getStock());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        
        productRepository.save(product);
        return ResponseEntity.ok().build();
    }
    
    // DELETE /api/vendeur/produits/{id} - Supprimer un produit
    @DeleteMapping("/produits/{id}")
    public ResponseEntity<Void> deleteProduit(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé"));
        
        // Vérifier que le produit appartient au vendeur
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendeur non trouvé"));
        
        if (!product.getShop().getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Non autorisé");
        }
        
        productRepository.delete(product);
        return ResponseEntity.ok().build();
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setNom(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrix(product.getPrice());
        dto.setStock(product.getStock());
        dto.setStatus(product.getStatus());
        dto.setImages(product.getImages());
        
        // Catégorie
        if (product.getCategory() != null) {
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(product.getCategory().getId());
            categoryDTO.setNom(product.getCategory().getName());
            dto.setCategorie(categoryDTO);
        }
        
        dto.setDateCreation(product.getCreatedAt());
        dto.setNombreVentes(product.getSalesCount() != null ? product.getSalesCount() : 0);
        
        return dto;
    }
}
```

### 2. DTOs

```java
@Data
public class UpdateProductRequest {
    private String nom;
    private String description;
    private Double prix;
    private Integer stock;
    private String status; // "ACTIVE" ou "HIDDEN"
}

@Data
public class ProductDTO {
    private UUID id;
    private String nom;
    private String description;
    private Double prix;
    private Integer stock;
    private String status;
    private List<String> images;
    private CategoryDTO categorie;
    private LocalDateTime dateCreation;
    private Integer nombreVentes;
}

@Data
public class CategoryDTO {
    private UUID id;
    private String nom;
}
```

### 3. Vérifier les annotations CORS

Assurez-vous que le controller a bien:
```java
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
```

### 4. Vérifier la configuration Spring Security

Si vous utilisez Spring Security, assurez-vous que les endpoints sont autorisés:
```java
.requestMatchers(HttpMethod.GET, "/api/vendeur/produits/**").hasRole("VENDOR")
.requestMatchers(HttpMethod.PUT, "/api/vendeur/produits/**").hasRole("VENDOR")
.requestMatchers(HttpMethod.DELETE, "/api/vendeur/produits/**").hasRole("VENDOR")
```

## Test

```bash
# Récupérer un produit
curl -H "X-User-Id: uuid-vendeur" \
     http://localhost:8081/api/vendeur/produits/uuid-produit

# Modifier un produit
curl -X PUT \
     -H "Content-Type: application/json" \
     -H "X-User-Id: uuid-vendeur" \
     -d '{"nom":"Nouveau nom","prix":20000,"stock":15,"status":"ACTIVE"}' \
     http://localhost:8081/api/vendeur/produits/uuid-produit

# Changer le statut
curl -X PUT \
     -H "Content-Type: application/json" \
     -H "X-User-Id: uuid-vendeur" \
     -d '{"status":"HIDDEN"}' \
     http://localhost:8081/api/vendeur/produits/uuid-produit
```

## Priorité: HAUTE
Sans ces endpoints, les vendeurs ne peuvent pas gérer leurs produits.
