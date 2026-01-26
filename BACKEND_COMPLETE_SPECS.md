# Spécifications Backend Complètes - Système Produits

## 🎯 Vue d'ensemble

Ce document contient TOUTES les spécifications backend nécessaires pour que le système produits fonctionne correctement avec le frontend (création, modification, suppression, affichage avec images et détails).

---

## 1️⃣ ENTITÉ PRODUIT (Base de données)

```java
@Entity
@Table(name = "produits")
public class Produit {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private BigDecimal prix;
    
    @Column(columnDefinition = "TEXT")
    private String images; // Stockage: "url1,url2,url3"
    
    @ManyToOne
    @JoinColumn(name = "boutique_id")
    private Boutique boutique;
    
    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;
    
    private Boolean disponible = true;
    
    @Column(name = "quantite_stock")
    private Integer quantiteStock = 0;
    
    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, HIDDEN
    
    // DÉTAILS PRODUIT
    @Column(columnDefinition = "TEXT")
    private String sizes; // JSON: ["S", "M", "L"]
    
    @Column(columnDefinition = "TEXT")
    private String colors; // JSON: ["Rouge", "Bleu"]
    
    private String marque;
    private String materiau; // Note: "materiau" pas "matiere"
    private String poids;
    private String dimensions;
    
    @Column(name = "periode_garantie")
    private String periodeGarantie; // Note: "periodeGarantie" pas "garantie"
    
    private String origine;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;
    
    @Column(name = "nombre_ventes")
    private Integer nombreVentes = 0;
    
    // Getters et Setters
}
```

---

## 2️⃣ DTO REQUEST - Création de Produit

```java
public class CreerProduitRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotBlank(message = "La description est obligatoire")
    private String description;
    
    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix doit être positif")
    private BigDecimal prix;
    
    @NotNull(message = "Le stock est obligatoire")
    @Min(value = 0, message = "Le stock doit être positif")
    private Integer stock; // ⚠️ IMPORTANT: "stock" pour POST
    
    @NotBlank(message = "La catégorie est obligatoire")
    private String categorieId;
    
    // DÉTAILS PRODUIT (tous optionnels)
    private String sizes; // JSON string: "[\"S\",\"M\",\"L\"]"
    private String colors; // JSON string: "[\"Rouge\",\"Bleu\"]"
    private String marque;
    private String materiau;
    private String poids;
    private String dimensions;
    private String periodeGarantie;
    private String origine;
    
    // Getters et Setters
}
```

---

## 3️⃣ DTO REQUEST - Modification de Produit

```java
public class ModifierProduitRequest {
    private String nom;
    private String description;
    private BigDecimal prix;
    
    @Min(value = 0, message = "Le stock doit être positif")
    private Integer quantiteStock; // ⚠️ IMPORTANT: "quantiteStock" pour PUT
    
    private String status; // ACTIVE, HIDDEN
    
    // DÉTAILS PRODUIT
    private String sizes;
    private String colors;
    private String marque;
    private String materiau;
    private String poids;
    private String dimensions;
    private String periodeGarantie;
    private String origine;
    
    // Getters et Setters
}
```

---

## 4️⃣ DTO RESPONSE - Retour Produit

```java
public class ProduitResponse {
    private String id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private List<String> images; // ⚠️ Retourner un array, pas une string
    private Integer stock;
    private Integer quantiteStock; // Alias pour compatibilité
    private String status;
    private Boolean disponible;
    private LocalDateTime dateCreation;
    private Integer nombreVentes;
    
    // DÉTAILS PRODUIT
    private String sizes; // JSON string
    private String colors; // JSON string
    private String marque;
    private String materiau;
    private String poids;
    private String dimensions;
    private String periodeGarantie;
    private String origine;
    
    // CATÉGORIE
    private CategorieInfo categorie;
    
    // BOUTIQUE
    private BoutiqueInfo boutique;
    
    public static class CategorieInfo {
        private String id;
        private String nom;
    }
    
    public static class BoutiqueInfo {
        private String id;
        private String nom;
        private String adresse;
        private Boolean livraison;
        private BigDecimal fraisLivraison;
    }
    
    // MAPPER depuis l'entité
    public static ProduitResponse fromEntity(Produit produit) {
        ProduitResponse response = new ProduitResponse();
        response.setId(produit.getId());
        response.setNom(produit.getNom());
        response.setDescription(produit.getDescription());
        response.setPrix(produit.getPrix());
        response.setStock(produit.getQuantiteStock());
        response.setQuantiteStock(produit.getQuantiteStock());
        response.setStatus(produit.getStatus());
        response.setDisponible(produit.getDisponible());
        response.setDateCreation(produit.getDateCreation());
        response.setNombreVentes(produit.getNombreVentes());
        
        // ⚠️ IMAGES: Convertir string → array
        if (produit.getImages() != null && !produit.getImages().isEmpty()) {
            response.setImages(Arrays.asList(produit.getImages().split(",")));
        } else {
            response.setImages(new ArrayList<>());
        }
        
        // DÉTAILS: Retourner les JSON strings tels quels
        response.setSizes(produit.getSizes());
        response.setColors(produit.getColors());
        response.setMarque(produit.getMarque());
        response.setMateriau(produit.getMateriau());
        response.setPoids(produit.getPoids());
        response.setDimensions(produit.getDimensions());
        response.setPeriodeGarantie(produit.getPeriodeGarantie());
        response.setOrigine(produit.getOrigine());
        
        // CATÉGORIE
        if (produit.getCategorie() != null) {
            CategorieInfo cat = new CategorieInfo();
            cat.setId(produit.getCategorie().getId());
            cat.setNom(produit.getCategorie().getNom());
            response.setCategorie(cat);
        }
        
        // BOUTIQUE
        if (produit.getBoutique() != null) {
            BoutiqueInfo bout = new BoutiqueInfo();
            bout.setId(produit.getBoutique().getId());
            bout.setNom(produit.getBoutique().getNom());
            bout.setAdresse(produit.getBoutique().getAdresse());
            bout.setLivraison(produit.getBoutique().getLivraison());
            bout.setFraisLivraison(produit.getBoutique().getFraisLivraison());
            response.setBoutique(bout);
        }
        
        return response;
    }
}
```

---

## 5️⃣ SERVICE - Logique Métier

```java
@Service
@Transactional
public class ProduitService {
    
    @Autowired
    private ProduitRepository produitRepository;
    
    @Autowired
    private BoutiqueRepository boutiqueRepository;
    
    @Autowired
    private CategorieRepository categorieRepository;
    
    /**
     * CRÉER UN PRODUIT
     */
    public ProduitResponse creerProduit(CreerProduitRequest request, String vendeurId) {
        // Vérifier que le vendeur a une boutique
        Boutique boutique = boutiqueRepository.findByVendeurId(vendeurId)
            .orElseThrow(() -> new RuntimeException("Vous devez créer une boutique d'abord"));
        
        // Vérifier que la catégorie existe
        Categorie categorie = categorieRepository.findById(request.getCategorieId())
            .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
        
        // Créer le produit
        Produit produit = new Produit();
        produit.setId(UUID.randomUUID().toString());
        produit.setNom(request.getNom());
        produit.setDescription(request.getDescription());
        produit.setPrix(request.getPrix());
        produit.setQuantiteStock(request.getStock()); // ⚠️ stock → quantiteStock
        produit.setBoutique(boutique);
        produit.setCategorie(categorie);
        produit.setDisponible(true);
        produit.setStatus("ACTIVE");
        produit.setDateCreation(LocalDateTime.now());
        produit.setNombreVentes(0);
        
        // DÉTAILS: Sauvegarder tels quels (déjà en JSON string)
        produit.setSizes(request.getSizes());
        produit.setColors(request.getColors());
        produit.setMarque(request.getMarque());
        produit.setMateriau(request.getMateriau());
        produit.setPoids(request.getPoids());
        produit.setDimensions(request.getDimensions());
        produit.setPeriodeGarantie(request.getPeriodeGarantie());
        produit.setOrigine(request.getOrigine());
        
        // Sauvegarder
        produit = produitRepository.save(produit);
        
        return ProduitResponse.fromEntity(produit);
    }
    
    /**
     * MODIFIER UN PRODUIT
     */
    public ProduitResponse modifierProduit(String produitId, ModifierProduitRequest request, String vendeurId) {
        // Récupérer le produit
        Produit produit = produitRepository.findById(produitId)
            .orElseThrow(() -> new RuntimeException("Produit introuvable"));
        
        // Vérifier que le produit appartient au vendeur
        if (!produit.getBoutique().getVendeur().getId().equals(vendeurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce produit");
        }
        
        // Mettre à jour les champs (seulement si non null)
        if (request.getNom() != null) produit.setNom(request.getNom());
        if (request.getDescription() != null) produit.setDescription(request.getDescription());
        if (request.getPrix() != null) produit.setPrix(request.getPrix());
        if (request.getQuantiteStock() != null) produit.setQuantiteStock(request.getQuantiteStock());
        if (request.getStatus() != null) produit.setStatus(request.getStatus());
        
        // DÉTAILS
        if (request.getSizes() != null) produit.setSizes(request.getSizes());
        if (request.getColors() != null) produit.setColors(request.getColors());
        if (request.getMarque() != null) produit.setMarque(request.getMarque());
        if (request.getMateriau() != null) produit.setMateriau(request.getMateriau());
        if (request.getPoids() != null) produit.setPoids(request.getPoids());
        if (request.getDimensions() != null) produit.setDimensions(request.getDimensions());
        if (request.getPeriodeGarantie() != null) produit.setPeriodeGarantie(request.getPeriodeGarantie());
        if (request.getOrigine() != null) produit.setOrigine(request.getOrigine());
        
        // Sauvegarder
        produit = produitRepository.save(produit);
        
        return ProduitResponse.fromEntity(produit);
    }
    
    /**
     * SUPPRIMER UN PRODUIT
     */
    public void supprimerProduit(String produitId, String vendeurId) {
        Produit produit = produitRepository.findById(produitId)
            .orElseThrow(() -> new RuntimeException("Produit introuvable"));
        
        if (!produit.getBoutique().getVendeur().getId().equals(vendeurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce produit");
        }
        
        produitRepository.delete(produit);
    }
    
    /**
     * RÉCUPÉRER UN PRODUIT (vendeur)
     */
    public ProduitResponse getProduit(String produitId, String vendeurId) {
        Produit produit = produitRepository.findById(produitId)
            .orElseThrow(() -> new RuntimeException("Produit introuvable"));
        
        if (!produit.getBoutique().getVendeur().getId().equals(vendeurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à voir ce produit");
        }
        
        return ProduitResponse.fromEntity(produit);
    }
    
    /**
     * LISTER LES PRODUITS (vendeur)
     */
    public List<ProduitResponse> getProduits(String vendeurId) {
        Boutique boutique = boutiqueRepository.findByVendeurId(vendeurId)
            .orElseThrow(() -> new RuntimeException("Boutique introuvable"));
        
        List<Produit> produits = produitRepository.findByBoutiqueId(boutique.getId());
        
        return produits.stream()
            .map(ProduitResponse::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * RÉCUPÉRER UN PRODUIT (public)
     */
    public ProduitResponse getProduitPublic(String produitId) {
        Produit produit = produitRepository.findById(produitId)
            .orElseThrow(() -> new RuntimeException("Produit introuvable"));
        
        return ProduitResponse.fromEntity(produit);
    }
}
```

---

## 6️⃣ CONTROLLER - Endpoints API

```java
@RestController
@RequestMapping("/api/vendeur/produits")
public class VendeurProduitController {
    
    @Autowired
    private ProduitService produitService;
    
    /**
     * POST /api/vendeur/produits/creer
     */
    @PostMapping("/creer")
    public ResponseEntity<ProduitResponse> creerProduit(
            @Valid @RequestBody CreerProduitRequest request,
            @RequestHeader("X-User-Id") String vendeurId) {
        
        ProduitResponse response = produitService.creerProduit(request, vendeurId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/vendeur/produits
     */
    @GetMapping
    public ResponseEntity<List<ProduitResponse>> getProduits(
            @RequestHeader("X-User-Id") String vendeurId) {
        
        List<ProduitResponse> produits = produitService.getProduits(vendeurId);
        return ResponseEntity.ok(produits);
    }
    
    /**
     * GET /api/vendeur/produits/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProduitResponse> getProduit(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String vendeurId) {
        
        ProduitResponse response = produitService.getProduit(id, vendeurId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * PUT /api/vendeur/produits/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProduitResponse> modifierProduit(
            @PathVariable String id,
            @Valid @RequestBody ModifierProduitRequest request,
            @RequestHeader("X-User-Id") String vendeurId) {
        
        ProduitResponse response = produitService.modifierProduit(id, request, vendeurId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * DELETE /api/vendeur/produits/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerProduit(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String vendeurId) {
        
        produitService.supprimerProduit(id, vendeurId);
        return ResponseEntity.ok().build();
    }
}

@RestController
@RequestMapping("/api/public/produits")
public class PublicProduitController {
    
    @Autowired
    private ProduitService produitService;
    
    /**
     * GET /api/public/produits/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProduitResponse> getProduit(@PathVariable String id) {
        ProduitResponse response = produitService.getProduitPublic(id);
        return ResponseEntity.ok(response);
    }
}
```

---

## 7️⃣ REPOSITORY

```java
@Repository
public interface ProduitRepository extends JpaRepository<Produit, String> {
    List<Produit> findByBoutiqueId(String boutiqueId);
    List<Produit> findByStatus(String status);
    List<Produit> findByCategorieId(String categorieId);
}
```

---

## 8️⃣ GESTION DES IMAGES

### Option 1: Stockage Local (Simple)

```java
@Service
public class ImageService {
    
    private static final String UPLOAD_DIR = "uploads/produits/";
    
    public String uploadImage(MultipartFile file) throws IOException {
        // Créer le dossier si nécessaire
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Générer un nom unique
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        
        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath);
        
        // Retourner l'URL
        return "/uploads/produits/" + filename;
    }
}
```

### Option 2: Stockage Cloud (AWS S3, Cloudinary)

```java
@Service
public class CloudinaryService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap("folder", "fasomarket/produits"));
        
        return (String) uploadResult.get("secure_url");
    }
}
```

---

## 9️⃣ VALIDATION ET GESTION D'ERREURS

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Erreur de validation");
        response.put("errors", errors);
        
        return ResponseEntity.badRequest().body(response);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex) {
        
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        
        return ResponseEntity.badRequest().body(response);
    }
}
```

---

## 🔟 POINTS CRITIQUES À RESPECTER

### ⚠️ Différences POST vs PUT
- **POST (création)**: Utiliser `stock` dans le request
- **PUT (modification)**: Utiliser `quantiteStock` dans le request
- **RESPONSE**: Retourner les deux (`stock` ET `quantiteStock`) pour compatibilité

### ⚠️ Format des détails
- **Frontend envoie**: JSON strings (`sizes: "[\"S\",\"M\"]"`)
- **Backend stocke**: JSON strings tels quels
- **Backend retourne**: JSON strings (le frontend parse)

### ⚠️ Noms des champs
- `materiau` (pas `matiere`)
- `periodeGarantie` (pas `garantie`)
- `sizes` (pas `tailles`)
- `colors` (pas `couleurs`)

### ⚠️ Images
- **Stockage DB**: String avec virgules (`"url1,url2,url3"`)
- **Retour API**: Array de strings (`["url1", "url2", "url3"]`)

### ⚠️ Sécurité
- Toujours vérifier que le vendeur est propriétaire du produit
- Valider tous les inputs
- Gérer les erreurs proprement

---

## 1️⃣1️⃣ EXEMPLE DE REQUÊTES

### Créer un produit
```http
POST /api/vendeur/produits/creer
Headers:
  X-User-Id: vendeur-123
  Content-Type: application/json

Body:
{
  "nom": "T-shirt Premium",
  "description": "T-shirt en coton bio",
  "prix": 15000,
  "stock": 50,
  "categorieId": "cat-123",
  "sizes": "[\"S\",\"M\",\"L\",\"XL\"]",
  "colors": "[\"Blanc\",\"Noir\",\"Bleu\"]",
  "marque": "FashionBF",
  "materiau": "100% Coton Bio",
  "poids": "200g",
  "dimensions": "Standard",
  "periodeGarantie": "6 mois",
  "origine": "Burkina Faso"
}
```

### Modifier un produit
```http
PUT /api/vendeur/produits/prod-456
Headers:
  X-User-Id: vendeur-123
  Content-Type: application/json

Body:
{
  "nom": "T-shirt Premium Édition Limitée",
  "prix": 18000,
  "quantiteStock": 30,
  "status": "ACTIVE"
}
```

### Récupérer un produit
```http
GET /api/vendeur/produits/prod-456
Headers:
  X-User-Id: vendeur-123
```

### Supprimer un produit
```http
DELETE /api/vendeur/produits/prod-456
Headers:
  X-User-Id: vendeur-123
```

---

## 1️⃣2️⃣ CHECKLIST D'IMPLÉMENTATION

- [ ] Créer/modifier l'entité `Produit` avec tous les champs
- [ ] Créer les DTOs (Request et Response)
- [ ] Implémenter le `ProduitService` avec toutes les méthodes
- [ ] Créer les controllers (vendeur et public)
- [ ] Implémenter le `ProduitRepository`
- [ ] Ajouter la gestion des images
- [ ] Configurer la validation des inputs
- [ ] Implémenter la gestion d'erreurs
- [ ] Tester tous les endpoints
- [ ] Vérifier la sécurité (autorisation vendeur)

---

## 📝 NOTES IMPORTANTES

1. **Les détails sont OPTIONNELS**: Un produit peut être créé sans détails
2. **Les images sont gérées séparément**: Upload d'abord, puis URLs dans le produit
3. **Le status par défaut est ACTIVE**: Les produits sont visibles dès la création
4. **La disponibilité dépend du stock**: Si stock = 0, disponible = false
5. **Les JSON strings ne sont PAS parsés côté backend**: Stockage et retour tels quels

---

**Ce document contient TOUT ce dont le backend a besoin pour implémenter le système produits complet.**
