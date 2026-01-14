# 🚨 FIX URGENT - Endpoint Admin Produits

## 🔍 Problèmes Identifiés

1. **Erreur 400** - "Utilisateur non trouvé" lors de la connexion admin
2. **Produits sans données** - `produit.nom is undefined`
3. **Informations boutique manquantes** - L'admin doit voir à quelle boutique appartient chaque produit

## 📋 Solutions Backend URGENTES

### 1. Fix Endpoint `/api/admin/produits`

```java
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminProduitController {

    @Autowired
    private ProduitService produitService;

    @GetMapping("/produits")
    public ResponseEntity<List<ProduitAdminDTO>> getAllProduits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<ProduitAdminDTO> produits = produitService.getAllProduitsForAdmin(page, size);
        return ResponseEntity.ok(produits);
    }

    @GetMapping("/produits/{id}/details")
    public ResponseEntity<ProduitAdminDTO> getProduitDetails(@PathVariable String id) {
        ProduitAdminDTO produit = produitService.getProduitDetailsForAdmin(id);
        return ResponseEntity.ok(produit);
    }

    @PutMapping("/produits/{id}/statut")
    public ResponseEntity<String> updateProduitStatut(
            @PathVariable String id, 
            @RequestBody Map<String, String> request) {
        String statut = request.get("statut");
        produitService.updateProduitStatut(id, statut);
        return ResponseEntity.ok("Statut mis à jour");
    }

    @DeleteMapping("/produits/{id}")
    public ResponseEntity<String> supprimerProduit(@PathVariable String id) {
        produitService.supprimerProduit(id);
        return ResponseEntity.ok("Produit supprimé");
    }
}
```

### 2. Créer ProduitAdminDTO

```java
public class ProduitAdminDTO {
    private String id;
    private String nom;              // ⚠️ OBLIGATOIRE
    private String description;
    private double prix;             // ⚠️ OBLIGATOIRE
    private int stock;               // ou quantiteStock
    private String status;           // ACTIVE, HIDDEN, etc.
    private String categorie;
    private String images;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    
    // Informations boutique ⚠️ OBLIGATOIRE pour admin
    private String boutiqueId;
    private String nomBoutique;
    private String adresseBoutique;
    
    // Informations vendeur ⚠️ OBLIGATOIRE pour admin
    private String vendeurId;
    private String nomVendeur;
    private String telephoneVendeur;
    private String emailVendeur;

    public ProduitAdminDTO(String id, String nom, String description, double prix, 
                          int stock, String status, String categorie, String images,
                          LocalDateTime dateCreation, LocalDateTime dateModification,
                          String boutiqueId, String nomBoutique, String adresseBoutique,
                          String vendeurId, String nomVendeur, String telephoneVendeur, String emailVendeur) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.prix = prix;
        this.stock = stock;
        this.status = status;
        this.categorie = categorie;
        this.images = images;
        this.dateCreation = dateCreation;
        this.dateModification = dateModification;
        this.boutiqueId = boutiqueId;
        this.nomBoutique = nomBoutique;
        this.adresseBoutique = adresseBoutique;
        this.vendeurId = vendeurId;
        this.nomVendeur = nomVendeur;
        this.telephoneVendeur = telephoneVendeur;
        this.emailVendeur = emailVendeur;
    }

    // Getters et setters...
}
```

### 3. Implémenter le Service

```java
@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;

    public List<ProduitAdminDTO> getAllProduitsForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Produit> produitsPage = produitRepository.findAll(pageable);
        
        return produitsPage.getContent().stream()
            .map(this::convertToProduitAdminDTO)
            .collect(Collectors.toList());
    }

    public ProduitAdminDTO getProduitDetailsForAdmin(String id) {
        Produit produit = produitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        return convertToProduitAdminDTO(produit);
    }

    private ProduitAdminDTO convertToProduitAdminDTO(Produit produit) {
        return new ProduitAdminDTO(
            produit.getId(),
            produit.getNom(),                    // ⚠️ DOIT EXISTER
            produit.getDescription(),
            produit.getPrix(),                   // ⚠️ DOIT ÊTRE > 0
            produit.getQuantiteStock(),          // ⚠️ DOIT ÊTRE >= 0
            produit.getStatut(),                 // ACTIVE, HIDDEN
            produit.getCategorie(),
            produit.getImages(),                 // URLs séparées par virgules
            produit.getDateCreation(),
            produit.getDateModification(),
            
            // Informations boutique
            produit.getBoutique().getId(),
            produit.getBoutique().getNom(),      // ⚠️ OBLIGATOIRE
            produit.getBoutique().getAdresse(),
            
            // Informations vendeur
            produit.getBoutique().getVendeur().getId(),
            produit.getBoutique().getVendeur().getNomComplet(),  // ⚠️ OBLIGATOIRE
            produit.getBoutique().getVendeur().getTelephone(),
            produit.getBoutique().getVendeur().getEmail()
        );
    }

    public void updateProduitStatut(String id, String statut) {
        Produit produit = produitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        produit.setStatut(statut);
        produitRepository.save(produit);
    }

    public void supprimerProduit(String id) {
        produitRepository.deleteById(id);
    }
}
```

### 4. Fix Authentification Admin

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/connexion")
    public ResponseEntity<AuthResponse> connexion(@RequestBody LoginRequest request) {
        try {
            // Vérifier si l'utilisateur existe
            Utilisateur utilisateur = utilisateurRepository.findByTelephone(request.getTelephone())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Vérifier le mot de passe
            if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasse())) {
                throw new RuntimeException("Mot de passe incorrect");
            }

            // Créer la réponse
            AuthResponse response = new AuthResponse();
            response.setUserId(utilisateur.getId());
            response.setRole(utilisateur.getRole());
            response.setToken("jwt-token-" + utilisateur.getId()); // Token simple pour test
            response.setMessage("Connexion réussie");

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, null, e.getMessage()));
        }
    }
}
```

## 🗄️ Vérifications Base de Données

### 1. Créer un utilisateur admin de test
```sql
-- Créer un admin de test
INSERT INTO utilisateurs (id, nom_complet, telephone, email, mot_de_passe, role, statut_compte, date_creation)
VALUES 
('admin-1', 'Admin Test', '+22670000000', 'admin@fasomarket.com', '$2a$10$encrypted_password', 'ADMIN', 'COMPTE_VALIDE', NOW());
```

### 2. Vérifier les données produits
```sql
-- Vérifier les produits avec leurs boutiques et vendeurs
SELECT 
    p.id, p.nom, p.prix, p.quantite_stock, p.statut,
    b.nom as boutique_nom, b.adresse,
    u.nom_complet as vendeur_nom, u.telephone as vendeur_tel
FROM produits p
JOIN boutiques b ON p.boutique_id = b.id
JOIN utilisateurs u ON b.vendeur_id = u.id
ORDER BY p.date_creation DESC;
```

## 🧪 Tests des Endpoints

### Test Connexion Admin
```bash
curl -X POST http://localhost:8081/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+22670000000",
    "motDePasse": "admin123"
  }'
```

### Test Liste Produits Admin
```bash
curl -H "X-User-Id: admin-1" http://localhost:8081/api/admin/produits
```

**Réponse attendue:**
```json
[
  {
    "id": "prod-1",
    "nom": "Chemise Traditionnelle",
    "description": "Belle chemise en coton traditionnel",
    "prix": 15000.0,
    "stock": 10,
    "status": "ACTIVE",
    "categorie": "Mode",
    "images": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    "dateCreation": "2024-01-13T10:00:00",
    "boutiqueId": "763c6363-1129-4da6-9bdb-dad7b4b54bda",
    "nomBoutique": "MaroShop",
    "adresseBoutique": "Pissy, Ouagadougou",
    "vendeurId": "vendeur-1",
    "nomVendeur": "Vendeur Test",
    "telephoneVendeur": "+22665300001",
    "emailVendeur": "vendeur@gmail.com"
  }
]
```

## ⚡ Actions IMMÉDIATES

### 1. Backend (URGENT)
1. Implémenter `ProduitAdminDTO` avec informations boutique/vendeur
2. Créer l'endpoint `/api/admin/produits` 
3. Corriger l'authentification admin
4. Ajouter un utilisateur admin de test

### 2. Base de Données (URGENT)
```sql
-- Créer admin de test
INSERT INTO utilisateurs (id, nom_complet, telephone, email, mot_de_passe, role, statut_compte, date_creation)
VALUES ('admin-1', 'Admin Test', '+22670000000', 'admin@fasomarket.com', 'admin123', 'ADMIN', 'COMPTE_VALIDE', NOW());

-- Vérifier les relations produits-boutiques-vendeurs
SELECT COUNT(*) FROM produits p 
JOIN boutiques b ON p.boutique_id = b.id 
JOIN utilisateurs u ON b.vendeur_id = u.id;
```

### 3. Frontend (DÉJÀ CORRIGÉ ✅)
- Protection contre `undefined` ajoutée
- Mapping des données avec fallbacks
- Affichage des informations boutique/vendeur

## 🎯 Résultat Attendu

Après ces corrections, l'admin pourra :
- ✅ Se connecter sans erreur 400
- ✅ Voir tous les produits avec leurs noms
- ✅ Identifier la boutique de chaque produit
- ✅ Connaître le vendeur responsable
- ✅ Gérer les statuts des produits

**PRIORITÉ MAXIMALE** 🔥🔥🔥