# Fix Urgent - Endpoint /api/public/boutiques

## Problème
- La boutique "MaroShop" existe avec statut ACTIVE dans la table `shops`
- L'endpoint `/api/public/boutiques` retourne une erreur 500
- Les clients ne peuvent pas voir la boutique

## Solution Rapide

### 1. Vérifier le nom de la table dans l'entité

```java
@Entity
@Table(name = "shops")  // ⚠️ La table s'appelle "shops" pas "boutiques"
@Data
public class Boutique {
    @Id
    private UUID id;
    
    private String name;
    private String address;
    private String category;
    private String description;
    private String email;
    private String phone;
    private String status;
    private Boolean delivery;
    
    @Column(name = "delivery_fee")
    private Double deliveryFee;
    
    @Column(name = "category_id")
    private UUID categoryId;
    
    @Column(name = "vendor_id")
    private UUID vendorId;
    
    // Autres champs...
}
```

### 2. Créer le Controller

```java
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PublicBoutiqueController {
    
    @Autowired
    private BoutiqueRepository boutiqueRepository;
    
    @GetMapping("/boutiques")
    public ResponseEntity<List<Boutique>> getBoutiques() {
        List<Boutique> boutiques = boutiqueRepository.findByStatus("ACTIVE");
        return ResponseEntity.ok(boutiques);
    }
}
```

### 3. Créer le Repository

```java
public interface BoutiqueRepository extends JpaRepository<Boutique, UUID> {
    List<Boutique> findByStatus(String status);
}
```

### 4. Ajouter CORS Configuration

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Test

```bash
curl http://localhost:8081/api/public/boutiques
```

Devrait retourner:
```json
[
  {
    "id": "763c6363-1129-4da6-9bdb-dad7b4b54bda",
    "name": "MaroShop",
    "address": "Pissy, Ouagadougou",
    "category": "Mode",
    "description": "Vente d'habit de qualité",
    "status": "ACTIVE",
    "delivery": false,
    "deliveryFee": 0.00
  }
]
```

## Priorité: CRITIQUE
Sans cet endpoint, les clients ne peuvent pas voir les boutiques disponibles.
