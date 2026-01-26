# Spécifications Backend - Détails des Produits

## 1. Entité Produit avec Détails

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
    private String images; // JSON array ou comma-separated
    
    @ManyToOne
    @JoinColumn(name = "boutique_id")
    private Boutique boutique;
    
    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;
    
    private Boolean disponible = true;
    private Integer quantiteStock = 0;
    
    // NOUVEAUX CHAMPS POUR LES DÉTAILS
    @Column(columnDefinition = "JSON")
    private String details; // Stockage JSON des détails
    
    @Column(columnDefinition = "TEXT")
    private String tailles; // JSON array: ["S", "M", "L", "XL"]
    
    @Column(columnDefinition = "TEXT")
    private String couleurs; // JSON array: ["Rouge", "Bleu", "Vert"]
    
    private String marque;
    private String matiere;
    private String poids;
    private String dimensions;
    private String garantie;
    private String origine;
    
    // Getters, setters...
}
```

## 2. DTO Response avec Détails

```java
public class ProduitResponse {
    private String id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private List<String> images;
    private BoutiqueInfo boutique;
    private String categorie;
    private Boolean disponible;
    private Integer quantiteStock;
    
    // NOUVEAUX CHAMPS
    private ProduitDetails details;
    
    public static class ProduitDetails {
        private List<String> taille;
        private List<String> couleur;
        private String marque;
        private String matiere;
        private String poids;
        private String dimensions;
        private String garantie;
        private String origine;
        private Map<String, Object> attributsPersonnalises; // Pour attributs dynamiques
        
        // Getters, setters...
    }
    
    public static class BoutiqueInfo {
        private String id;
        private String nom;
        private String adresse;
        private Boolean livraison;
        private BigDecimal fraisLivraison;
        
        // Getters, setters...
    }
    
    public static ProduitResponse fromEntity(Produit produit) {
        ProduitResponse response = new ProduitResponse();
        response.setId(produit.getId());
        response.setNom(produit.getNom());
        response.setDescription(produit.getDescription());
        response.setPrix(produit.getPrix());
        
        // Mapper les images
        if (produit.getImages() != null) {
            try {
                response.setImages(Arrays.asList(produit.getImages().split(",")));
            } catch (Exception e) {
                response.setImages(List.of());
            }
        }
        
        // Mapper la boutique
        if (produit.getBoutique() != null) {
            BoutiqueInfo boutiqueInfo = new BoutiqueInfo();
            boutiqueInfo.setId(produit.getBoutique().getId());
            boutiqueInfo.setNom(produit.getBoutique().getNom());
            boutiqueInfo.setAdresse(produit.getBoutique().getAdresse());
            boutiqueInfo.setLivraison(produit.getBoutique().getLivraison());
            boutiqueInfo.setFraisLivraison(produit.getBoutique().getFraisLivraison());
            response.setBoutique(boutiqueInfo);
        }
        
        response.setCategorie(produit.getCategorie() != null ? produit.getCategorie().getNom() : null);
        response.setDisponible(produit.getDisponible());
        response.setQuantiteStock(produit.getQuantiteStock());
        
        // MAPPER LES DÉTAILS
        ProduitDetails details = new ProduitDetails();
        
        // Mapper les tailles
        if (produit.getTailles() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                details.setTaille(mapper.readValue(produit.getTailles(), 
                    new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                details.setTaille(List.of());
            }
        }
        
        // Mapper les couleurs
        if (produit.getCouleurs() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                details.setCouleur(mapper.readValue(produit.getCouleurs(), 
                    new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                details.setCouleur(List.of());
            }
        }
        
        details.setMarque(produit.getMarque());
        details.setMatiere(produit.getMatiere());
        details.setPoids(produit.getPoids());
        details.setDimensions(produit.getDimensions());
        details.setGarantie(produit.getGarantie());
        details.setOrigine(produit.getOrigine());
        
        // Mapper les détails JSON personnalisés
        if (produit.getDetails() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                details.setAttributsPersonnalises(mapper.readValue(produit.getDetails(), 
                    new TypeReference<Map<String, Object>>() {}));
            } catch (Exception e) {
                details.setAttributsPersonnalises(Map.of());
            }
        }
        
        response.setDetails(details);
        
        return response;
    }
}
```

## 3. DTO Request pour Création/Modification

```java
public class CreerProduitRequest {
    @NotBlank
    private String nom;
    
    @NotBlank
    private String description;
    
    @NotNull
    @DecimalMin("0.0")
    private BigDecimal prix;
    
    private List<String> images;
    
    @NotBlank
    private String categorieId;
    
    @Min(0)
    private Integer quantiteStock = 0;
    
    // NOUVEAUX CHAMPS POUR LES DÉTAILS
    private List<String> tailles;
    private List<String> couleurs;
    private String marque;
    private String matiere;
    private String poids;
    private String dimensions;
    private String garantie;
    private String origine;
    private Map<String, Object> attributsPersonnalises;
    
    // Getters, setters...
}
```

## 4. Service avec Gestion des Détails

```java
@Service
public class ProduitService {
    
    private final ProduitRepository produitRepository;
    private final ObjectMapper objectMapper;
    
    public ProduitResponse creerProduit(CreerProduitRequest request, String vendeurId) {
        Produit produit = new Produit();
        produit.setId(UUID.randomUUID().toString());
        produit.setNom(request.getNom());
        produit.setDescription(request.getDescription());
        produit.setPrix(request.getPrix());
        produit.setQuantiteStock(request.getQuantiteStock());
        
        // Gérer les images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            produit.setImages(String.join(",", request.getImages()));
        }
        
        // GÉRER LES DÉTAILS
        if (request.getTailles() != null && !request.getTailles().isEmpty()) {
            try {
                produit.setTailles(objectMapper.writeValueAsString(request.getTailles()));
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la sérialisation des tailles");
            }
        }
        
        if (request.getCouleurs() != null && !request.getCouleurs().isEmpty()) {
            try {
                produit.setCouleurs(objectMapper.writeValueAsString(request.getCouleurs()));
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la sérialisation des couleurs");
            }
        }
        
        produit.setMarque(request.getMarque());
        produit.setMatiere(request.getMatiere());
        produit.setPoids(request.getPoids());
        produit.setDimensions(request.getDimensions());
        produit.setGarantie(request.getGarantie());
        produit.setOrigine(request.getOrigine());
        
        // Gérer les attributs personnalisés
        if (request.getAttributsPersonnalises() != null && !request.getAttributsPersonnalises().isEmpty()) {
            try {
                produit.setDetails(objectMapper.writeValueAsString(request.getAttributsPersonnalises()));
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la sérialisation des détails");
            }
        }
        
        // Associer à la boutique du vendeur
        Boutique boutique = boutiqueRepository.findByVendeurId(vendeurId)
            .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));
        produit.setBoutique(boutique);
        
        // Associer à la catégorie
        Categorie categorie = categorieRepository.findById(request.getCategorieId())
            .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        produit.setCategorie(categorie);
        
        produit = produitRepository.save(produit);
        return ProduitResponse.fromEntity(produit);
    }
    
    public ProduitResponse getProduitDetails(String produitId) {
        Produit produit = produitRepository.findById(produitId)
            .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        return ProduitResponse.fromEntity(produit);
    }
}
```

## 5. Controller avec Endpoints

```java
@RestController
@RequestMapping("/api/public")
public class PublicProduitController {
    
    private final ProduitService produitService;
    
    @GetMapping("/produits/{id}")
    public ResponseEntity<ProduitResponse> getProduit(@PathVariable String id) {
        ProduitResponse produit = produitService.getProduitDetails(id);
        return ResponseEntity.ok(produit);
    }
}

@RestController
@RequestMapping("/api/vendeur")
@PreAuthorize("hasRole('VENDOR')")
public class VendeurProduitController {
    
    private final ProduitService produitService;
    
    @PostMapping("/produits/creer")
    public ResponseEntity<ProduitResponse> creerProduit(
            @Valid @RequestBody CreerProduitRequest request,
            Authentication auth) {
        
        String vendeurId = getUserId(auth);
        ProduitResponse produit = produitService.creerProduit(request, vendeurId);
        return ResponseEntity.ok(produit);
    }
    
    @PutMapping("/produits/{id}")
    public ResponseEntity<ProduitResponse> modifierProduit(
            @PathVariable String id,
            @Valid @RequestBody CreerProduitRequest request,
            Authentication auth) {
        
        String vendeurId = getUserId(auth);
        ProduitResponse produit = produitService.modifierProduit(id, request, vendeurId);
        return ResponseEntity.ok(produit);
    }
}
```

## 6. Migration Base de Données

```sql
-- Ajouter les nouvelles colonnes à la table produits
ALTER TABLE produits 
ADD COLUMN details JSON,
ADD COLUMN tailles TEXT,
ADD COLUMN couleurs TEXT,
ADD COLUMN marque VARCHAR(100),
ADD COLUMN matiere VARCHAR(100),
ADD COLUMN poids VARCHAR(50),
ADD COLUMN dimensions VARCHAR(100),
ADD COLUMN garantie VARCHAR(100),
ADD COLUMN origine VARCHAR(100);

-- Index pour les recherches sur les détails
CREATE INDEX idx_produits_marque ON produits(marque);
CREATE INDEX idx_produits_matiere ON produits(matiere);
```

## 7. Exemples de Données

### Exemple 1: Vêtement
```json
{
  "nom": "T-shirt Premium",
  "description": "T-shirt en coton bio de haute qualité",
  "prix": 15000,
  "tailles": ["S", "M", "L", "XL"],
  "couleurs": ["Blanc", "Noir", "Bleu", "Rouge"],
  "marque": "FashionBF",
  "matiere": "100% Coton Bio",
  "origine": "Burkina Faso",
  "garantie": "6 mois"
}
```

### Exemple 2: Électronique
```json
{
  "nom": "Smartphone XYZ",
  "description": "Smartphone dernière génération",
  "prix": 250000,
  "couleurs": ["Noir", "Blanc", "Bleu"],
  "marque": "TechBrand",
  "poids": "180g",
  "dimensions": "15.5 x 7.5 x 0.8 cm",
  "garantie": "2 ans",
  "attributsPersonnalises": {
    "ecran": "6.1 pouces",
    "stockage": "128GB",
    "ram": "6GB",
    "batterie": "4000mAh"
  }
}
```

### Exemple 3: Alimentation
```json
{
  "nom": "Riz Local Premium",
  "description": "Riz cultivé localement",
  "prix": 800,
  "origine": "Bobo-Dioulasso",
  "poids": "1kg",
  "attributsPersonnalises": {
    "variete": "Riz blanc",
    "recolte": "2024",
    "certification": "Bio"
  }
}
```

## 8. Frontend Integration

Le frontend peut maintenant afficher:
- **Sélection de taille** avec boutons interactifs
- **Sélection de couleur** avec boutons colorés
- **Détails techniques** dans un tableau organisé
- **Attributs personnalisés** selon la catégorie
- **Informations de garantie et origine**

Cette implémentation permet une gestion complète et flexible des détails produits selon leur catégorie.