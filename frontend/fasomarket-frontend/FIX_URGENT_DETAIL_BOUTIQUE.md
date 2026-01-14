# 🚨 FIX URGENT - Endpoints Détail Boutique

## 🔍 Problèmes Identifiés

1. **Nom de boutique manquant** - Affiché comme "Vente d'habit de qualité" au lieu du nom
2. **Produits sans données** - "Produit sans nom", "Prix non disponible"
3. **Endpoints manquants** ou mal configurés

## 📋 Solutions Backend URGENTES

### 1. Fix Endpoint `/api/public/boutiques/{id}`

```java
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicBoutiqueController {

    @GetMapping("/boutiques/{id}")
    public ResponseEntity<BoutiqueDetailDTO> getBoutiqueDetails(@PathVariable String id) {
        BoutiqueDetailDTO boutique = boutiqueService.getBoutiqueDetails(id);
        return ResponseEntity.ok(boutique);
    }
}
```

### 2. Créer BoutiqueDetailDTO

```java
public class BoutiqueDetailDTO {
    private String id;
    private String nom;              // ⚠️ OBLIGATOIRE
    private String description;
    private String adresse;
    private String telephone;
    private String email;
    private String categorie;
    private boolean livraison;
    private double fraisLivraison;
    private String statut;
    private String logoUrl;
    private String bannerUrl;
    private double note;
    private int nombreAvis;
    
    // Constructeurs et getters/setters
    public BoutiqueDetailDTO(String id, String nom, String description, 
                           String adresse, String telephone, String email,
                           String categorie, boolean livraison, double fraisLivraison,
                           String statut) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.adresse = adresse;
        this.telephone = telephone;
        this.email = email;
        this.categorie = categorie;
        this.livraison = livraison;
        this.fraisLivraison = fraisLivraison;
        this.statut = statut;
    }
    
    // Getters et setters...
}
```

### 3. Fix Endpoint `/api/public/boutiques/{id}/produits`

```java
@GetMapping("/boutiques/{id}/produits")
public ResponseEntity<List<ProduitPublicDTO>> getBoutiqueProduits(@PathVariable String id) {
    List<ProduitPublicDTO> produits = boutiqueService.getBoutiqueProduits(id);
    return ResponseEntity.ok(produits);
}
```

### 4. Créer ProduitPublicDTO

```java
public class ProduitPublicDTO {
    private String id;
    private String nom;              // ⚠️ OBLIGATOIRE
    private String description;
    private double prix;             // ⚠️ OBLIGATOIRE (pas null)
    private int quantiteStock;       // ⚠️ OBLIGATOIRE
    private boolean disponible;
    private String categorie;
    private String images;           // URLs séparées par virgules
    private String boutiqueId;
    private String nomBoutique;
    
    public ProduitPublicDTO(String id, String nom, String description, 
                          double prix, int quantiteStock, boolean disponible,
                          String categorie, String images, String boutiqueId, String nomBoutique) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.prix = prix;
        this.quantiteStock = quantiteStock;
        this.disponible = disponible;
        this.categorie = categorie;
        this.images = images;
        this.boutiqueId = boutiqueId;
        this.nomBoutique = nomBoutique;
    }
    
    // Getters et setters...
}
```

### 5. Implémenter les Services

```java
@Service
public class BoutiqueService {

    public BoutiqueDetailDTO getBoutiqueDetails(String id) {
        Boutique boutique = boutiqueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));
            
        return new BoutiqueDetailDTO(
            boutique.getId(),
            boutique.getNom(),           // ⚠️ DOIT EXISTER
            boutique.getDescription(),
            boutique.getAdresse(),
            boutique.getTelephone(),
            boutique.getEmail(),
            boutique.getCategorie().getNom(),
            boutique.isLivraison(),
            boutique.getFraisLivraison(),
            boutique.getStatut()
        );
    }
    
    public List<ProduitPublicDTO> getBoutiqueProduits(String boutiqueId) {
        List<Produit> produits = produitRepository.findByBoutiqueIdAndActifTrue(boutiqueId);
        
        return produits.stream()
            .map(this::convertToProduitPublicDTO)
            .collect(Collectors.toList());
    }
    
    private ProduitPublicDTO convertToProduitPublicDTO(Produit produit) {
        return new ProduitPublicDTO(
            produit.getId(),
            produit.getNom(),            // ⚠️ DOIT EXISTER
            produit.getDescription(),
            produit.getPrix(),           // ⚠️ DOIT ÊTRE > 0
            produit.getQuantiteStock(),  // ⚠️ DOIT ÊTRE >= 0
            produit.isDisponible(),
            produit.getCategorie(),
            produit.getImages(),         // URLs séparées par virgules
            produit.getBoutique().getId(),
            produit.getBoutique().getNom()
        );
    }
}
```

## 🗄️ Vérifications Base de Données URGENTES

### 1. Vérifier la table boutiques
```sql
-- Vérifier la structure
DESCRIBE boutiques;

-- Vérifier les données
SELECT id, nom, description, adresse, telephone, email, statut 
FROM boutiques 
WHERE id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';

-- Si nom est NULL, corriger
UPDATE boutiques 
SET nom = 'MaroShop' 
WHERE id = '763c6363-1129-4da6-9bdb-dad7b4b54bda' AND nom IS NULL;
```

### 2. Vérifier la table produits
```sql
-- Vérifier la structure
DESCRIBE produits;

-- Vérifier les données
SELECT id, nom, description, prix, quantite_stock, disponible, boutique_id
FROM produits 
WHERE boutique_id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';

-- Corriger les produits sans nom/prix
UPDATE produits 
SET nom = CONCAT('Produit ', id),
    prix = 15000,
    quantite_stock = 10,
    disponible = true
WHERE boutique_id = '763c6363-1129-4da6-9bdb-dad7b4b54bda' 
  AND (nom IS NULL OR prix IS NULL OR prix = 0);
```

## 🧪 Tests des Endpoints

### Test Détail Boutique
```bash
curl -X GET http://localhost:8081/api/public/boutiques/763c6363-1129-4da6-9bdb-dad7b4b54bda
```

**Réponse attendue:**
```json
{
  "id": "763c6363-1129-4da6-9bdb-dad7b4b54bda",
  "nom": "MaroShop",
  "description": "Vente d'habit de qualité",
  "adresse": "Pissy, Ouagadougou",
  "telephone": "+22665300001",
  "email": "vendeur@gmail.com",
  "categorie": "Mode",
  "livraison": false,
  "fraisLivraison": 0.0,
  "statut": "ACTIVE"
}
```

### Test Produits Boutique
```bash
curl -X GET http://localhost:8081/api/public/boutiques/763c6363-1129-4da6-9bdb-dad7b4b54bda/produits
```

**Réponse attendue:**
```json
[
  {
    "id": "produit-1",
    "nom": "Chemise Traditionnelle",
    "description": "Belle chemise en coton",
    "prix": 15000.0,
    "quantiteStock": 10,
    "disponible": true,
    "categorie": "Mode",
    "images": "https://example.com/image1.jpg",
    "boutiqueId": "763c6363-1129-4da6-9bdb-dad7b4b54bda",
    "nomBoutique": "MaroShop"
  }
]
```

## ⚡ Actions IMMÉDIATES

### 1. Base de Données (URGENT)
```sql
-- Corriger la boutique
UPDATE boutiques 
SET nom = 'MaroShop' 
WHERE id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';

-- Ajouter des produits de test
INSERT INTO produits (id, nom, description, prix, quantite_stock, disponible, boutique_id, categorie, images, actif)
VALUES 
('prod-1', 'Chemise Traditionnelle', 'Belle chemise en coton traditionnel', 15000, 10, true, '763c6363-1129-4da6-9bdb-dad7b4b54bda', 'Mode', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', true),
('prod-2', 'Pantalon Bogolan', 'Pantalon en tissu bogolan authentique', 25000, 5, true, '763c6363-1129-4da6-9bdb-dad7b4b54bda', 'Mode', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', true),
('prod-3', 'Boubou Élégant', 'Boubou brodé pour occasions spéciales', 45000, 3, true, '763c6363-1129-4da6-9bdb-dad7b4b54bda', 'Mode', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', true);
```

### 2. Backend (URGENT)
1. Implémenter les DTOs ci-dessus
2. Créer les endpoints manquants
3. Vérifier les mappings entité → DTO
4. Tester avec Postman

### 3. Vérification (URGENT)
1. Tester les endpoints avec cURL
2. Vérifier les logs Spring Boot
3. Confirmer que les données sont correctes

## 🎯 Résultat Attendu

Après ces corrections, la page affichera :
- **Nom de boutique** : "MaroShop"
- **Produits avec noms** : "Chemise Traditionnelle", etc.
- **Prix corrects** : "15 000 FCFA", "25 000 FCFA"
- **Stock disponible** : "Stock: 10", "Stock: 5"

**PRIORITÉ MAXIMALE** 🔥🔥🔥