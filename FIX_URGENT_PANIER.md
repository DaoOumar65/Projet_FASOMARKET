# Fix Urgent - Endpoints Panier

## Problème
L'endpoint `/api/client/panier` retourne 404. Le panier n'est pas encore implémenté côté backend.

## Solution Rapide

### 1. Créer l'entité CartItem

```java
@Entity
@Table(name = "cart_items")
@Data
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    private Integer quantity;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 2. Créer le Repository

```java
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByUserId(UUID userId);
    Optional<CartItem> findByUserIdAndProductId(UUID userId, UUID productId);
    void deleteByUserId(UUID userId);
}
```

### 3. Créer le Controller

```java
@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CartController {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // GET /api/client/panier
    @GetMapping("/panier")
    public ResponseEntity<List<CartItemDTO>> getPanier(@RequestHeader("X-User-Id") UUID userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        List<CartItemDTO> dtos = items.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    // POST /api/client/panier/ajouter
    @PostMapping("/panier/ajouter")
    public ResponseEntity<Void> ajouterAuPanier(
            @RequestBody AjouterPanierRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        
        // Vérifier si le produit existe déjà dans le panier
        Optional<CartItem> existingItem = cartItemRepository
            .findByUserIdAndProductId(userId, request.getProduitId());
        
        if (existingItem.isPresent()) {
            // Incrémenter la quantité
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantite());
            cartItemRepository.save(item);
        } else {
            // Créer un nouveau item
            Product product = productRepository.findById(request.getProduitId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé"));
            
            CartItem newItem = new CartItem();
            newItem.setUser(new User(userId)); // Simplification
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantite());
            newItem.setCreatedAt(LocalDateTime.now());
            cartItemRepository.save(newItem);
        }
        
        return ResponseEntity.ok().build();
    }
    
    // DELETE /api/client/panier/{itemId}
    @DeleteMapping("/panier/{itemId}")
    public ResponseEntity<Void> supprimerDuPanier(
            @PathVariable UUID itemId,
            @RequestHeader("X-User-Id") UUID userId) {
        
        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Article non trouvé"));
        
        // Vérifier que l'item appartient bien à l'utilisateur
        if (!item.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Non autorisé");
        }
        
        cartItemRepository.delete(item);
        return ResponseEntity.ok().build();
    }
    
    // DELETE /api/client/panier/vider
    @DeleteMapping("/panier/vider")
    @Transactional
    public ResponseEntity<Void> viderPanier(@RequestHeader("X-User-Id") UUID userId) {
        cartItemRepository.deleteByUserId(userId);
        return ResponseEntity.ok().build();
    }
    
    private CartItemDTO convertToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setQuantite(item.getQuantity());
        dto.setCreatedAt(item.getCreatedAt());
        
        // Mapper le produit
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(item.getProduct().getId());
        productDTO.setNom(item.getProduct().getName());
        productDTO.setPrix(item.getProduct().getPrice());
        productDTO.setImages(item.getProduct().getImages());
        dto.setProduit(productDTO);
        
        return dto;
    }
}
```

### 4. DTOs

```java
@Data
public class CartItemDTO {
    private UUID id;
    private ProductDTO produit;
    private Integer quantite;
    private LocalDateTime createdAt;
}

@Data
public class ProductDTO {
    private UUID id;
    private String nom;
    private Double prix;
    private List<String> images;
}

@Data
public class AjouterPanierRequest {
    private UUID produitId;
    private Integer quantite;
}
```

### 5. Migration SQL

```sql
-- Créer la table cart_items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Index pour performance
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

## Test

```bash
# Récupérer le panier
curl -H "X-User-Id: 1e7c6f1d-fc2d-4f78-b00c-cb4bf98b5884" \
     http://localhost:8081/api/client/panier

# Ajouter au panier
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-User-Id: 1e7c6f1d-fc2d-4f78-b00c-cb4bf98b5884" \
     -d '{"produitId":"uuid-produit","quantite":1}' \
     http://localhost:8081/api/client/panier/ajouter
```

## Priorité: HAUTE
Le panier est une fonctionnalité essentielle pour les clients.
