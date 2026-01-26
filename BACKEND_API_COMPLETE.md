# 🚀 SPÉCIFICATIONS BACKEND COMPLÈTES - API FasoMarket

## 📋 TABLE DES MATIÈRES
1. [Upload d'Images](#1-upload-dimages)
2. [Gestion Produits](#2-gestion-produits)
3. [Gestion Panier](#3-gestion-panier)
4. [Gestion Commandes](#4-gestion-commandes)
5. [Gestion Boutiques](#5-gestion-boutiques)
6. [Authentification](#6-authentification)
7. [Catégories](#7-catégories)

---

## 1️⃣ UPLOAD D'IMAGES

### Endpoint
```
POST /api/upload/image
Content-Type: multipart/form-data
```

### Request
```java
@PostMapping("/api/upload/image")
public ResponseEntity<Map<String, String>> uploadImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam("type") String type) {
    
    // Validation
    if (file.isEmpty()) {
        throw new RuntimeException("Fichier vide");
    }
    
    // Vérifier le type de fichier
    String contentType = file.getContentType();
    if (!contentType.startsWith("image/")) {
        throw new RuntimeException("Le fichier doit être une image");
    }
    
    // Vérifier la taille (max 5MB)
    if (file.getSize() > 5 * 1024 * 1024) {
        throw new RuntimeException("L'image ne doit pas dépasser 5MB");
    }
    
    // Upload
    String url = imageService.uploadImage(file, type);
    
    return ResponseEntity.ok(Map.of("url", url));
}
```

### Service d'Upload
```java
@Service
public class ImageService {
    
    private static final String UPLOAD_DIR = "uploads/";
    
    public String uploadImage(MultipartFile file, String type) throws IOException {
        // Créer le dossier si nécessaire
        Path uploadPath = Paths.get(UPLOAD_DIR + type);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Générer un nom unique
        String filename = UUID.randomUUID().toString() + "_" + 
            file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
        Path filePath = uploadPath.resolve(filename);
        
        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Retourner l'URL
        return "/uploads/" + type + "/" + filename;
    }
}
```

### Configuration Static Resources
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
```

---

## 2️⃣ GESTION PRODUITS

### A. Créer un Produit
```
POST /api/vendeur/produits/creer
Headers: X-User-Id: {vendeurId}
```

**Request Body:**
```json
{
  "nom": "iPhone 15 Pro",
  "description": "Smartphone dernière génération",
  "prix": 850000,
  "stock": 10,
  "categorieId": "cat-123",
  "images": ["url1", "url2"],
  "sizes": "[\"128GB\",\"256GB\"]",
  "colors": "[\"Noir\",\"Blanc\"]",
  "marque": "Apple",
  "materiau": "Titane",
  "poids": "221g",
  "dimensions": "159.9 x 76.7 x 8.25 mm",
  "periodeGarantie": "1 an",
  "origine": "USA"
}
```

**Response:**
```json
{
  "id": "prod-456",
  "nom": "iPhone 15 Pro",
  "prix": 850000,
  "stock": 10,
  "images": ["url1", "url2"],
  "sizes": "[\"128GB\",\"256GB\"]",
  "colors": "[\"Noir\",\"Blanc\"]",
  "marque": "Apple",
  "materiau": "Titane",
  "status": "ACTIVE",
  "dateCreation": "2024-01-15T10:30:00",
  "categorie": {
    "id": "cat-123",
    "nom": "Électronique"
  },
  "boutique": {
    "id": "bout-789",
    "nom": "TechStore",
    "adresse": "Ouagadougou",
    "livraison": true,
    "fraisLivraison": 2000
  }
}
```

### B. Modifier un Produit
```
PUT /api/vendeur/produits/{id}
Headers: X-User-Id: {vendeurId}
```

**Request Body:**
```json
{
  "nom": "iPhone 15 Pro Max",
  "prix": 950000,
  "quantiteStock": 5,
  "status": "ACTIVE",
  "sizes": "[\"256GB\",\"512GB\"]"
}
```

### C. Supprimer un Produit
```
DELETE /api/vendeur/produits/{id}
Headers: X-User-Id: {vendeurId}
```

### D. Lister Produits Vendeur
```
GET /api/vendeur/produits
Headers: X-User-Id: {vendeurId}
```

**Response:**
```json
[
  {
    "id": "prod-1",
    "nom": "Produit 1",
    "prix": 15000,
    "stock": 10,
    "status": "ACTIVE",
    "images": ["url1"],
    "sizes": "[\"S\",\"M\",\"L\"]",
    "colors": "[\"Rouge\",\"Bleu\"]",
    "marque": "Nike",
    "categorie": {"id": "cat-1", "nom": "Mode"},
    "dateCreation": "2024-01-15T10:30:00",
    "nombreVentes": 5
  }
]
```

### E. Récupérer un Produit (Public)
```
GET /api/public/produits/{id}
```

---

## 3️⃣ GESTION PANIER

### A. Ajouter au Panier
```
POST /api/client/panier/ajouter
Headers: X-User-Id: {clientId}
```

**Request:**
```json
{
  "produitId": "prod-123",
  "quantite": 2
}
```

**Response:**
```json
{
  "message": "Produit ajouté au panier",
  "panier": {
    "items": [
      {
        "id": "item-1",
        "produit": {
          "id": "prod-123",
          "nom": "T-shirt",
          "prix": 15000,
          "images": ["url1"]
        },
        "quantite": 2
      }
    ],
    "total": 30000
  }
}
```

### B. Récupérer le Panier
```
GET /api/client/panier
Headers: X-User-Id: {clientId}
```

**Response:**
```json
[
  {
    "id": "item-1",
    "produit": {
      "id": "prod-123",
      "nom": "T-shirt",
      "prix": 15000,
      "images": ["url1"],
      "boutique": {
        "id": "bout-1",
        "nom": "Fashion Store",
        "adresse": "Ouagadougou",
        "livraison": true,
        "fraisLivraison": 1000
      }
    },
    "quantite": 2
  }
]
```

### C. Supprimer du Panier
```
DELETE /api/client/panier/{itemId}
Headers: X-User-Id: {clientId}
```

### D. Vider le Panier
```
DELETE /api/client/panier/vider
Headers: X-User-Id: {clientId}
```

---

## 4️⃣ GESTION COMMANDES

### A. Créer une Commande
```
POST /api/client/commandes/creer
Headers: X-User-Id: {clientId}
```

**Request:**
```json
{
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "methodePaiement": "MOBILE_MONEY",
  "numeroTelephone": "+22670123456"
}
```

**Response:**
```json
{
  "id": "cmd-789",
  "numero": "CMD-20240115-001",
  "statut": "EN_ATTENTE",
  "total": 32000,
  "items": [...],
  "dateCreation": "2024-01-15T10:30:00"
}
```

### B. Historique Commandes Client
```
GET /api/client/historique-commandes
Headers: X-User-Id: {clientId}
```

### C. Détails d'une Commande
```
GET /api/client/commandes/{id}
Headers: X-User-Id: {clientId}
```

### D. Commandes Vendeur
```
GET /api/vendeur/commandes
Headers: X-User-Id: {vendeurId}
```

### E. Mettre à jour Statut Commande
```
PUT /api/vendeur/commandes/{id}/statut
Headers: X-User-Id: {vendeurId}
```

**Request:**
```json
{
  "statut": "EN_PREPARATION"
}
```

**Statuts possibles:**
- `EN_ATTENTE`
- `EN_PREPARATION`
- `PRETE`
- `EN_LIVRAISON`
- `LIVREE`
- `ANNULEE`

---

## 5️⃣ GESTION BOUTIQUES

### A. Créer une Boutique
```
POST /api/vendeur/boutiques/creer
Headers: X-User-Id: {vendeurId}
```

**Request:**
```json
{
  "nom": "TechStore BF",
  "description": "Boutique d'électronique",
  "adresse": "Avenue Kwame Nkrumah, Ouagadougou",
  "telephone": "+22670123456",
  "livraison": true,
  "fraisLivraison": 2000
}
```

### B. Récupérer Boutique Vendeur
```
GET /api/vendeur/boutiques
Headers: X-User-Id: {vendeurId}
```

### C. Modifier Boutique
```
PUT /api/vendeur/boutiques/{id}
Headers: X-User-Id: {vendeurId}
```

### D. Lister Boutiques (Public)
```
GET /api/public/boutiques?page=0&size=20
```

### E. Détails Boutique (Public)
```
GET /api/public/boutiques/{id}
```

### F. Produits d'une Boutique (Public)
```
GET /api/public/boutiques/{id}/produits
```

---

## 6️⃣ AUTHENTIFICATION

### A. Connexion
```
POST /api/auth/connexion
```

**Request:**
```json
{
  "telephone": "+22670123456",
  "motDePasse": "password123"
}
```

**Response:**
```json
{
  "userId": "user-123",
  "token": "jwt-token-here",
  "user": {
    "id": "user-123",
    "nomComplet": "Jean Dupont",
    "telephone": "+22670123456",
    "email": "jean@example.com",
    "role": "CLIENT"
  }
}
```

### B. Inscription Client
```
POST /api/auth/inscription-client
```

**Request:**
```json
{
  "nomComplet": "Jean Dupont",
  "telephone": "+22670123456",
  "email": "jean@example.com",
  "motDePasse": "password123"
}
```

### C. Inscription Vendeur
```
POST /api/auth/inscription-vendeur
```

**Request:**
```json
{
  "nomComplet": "Marie Kaboré",
  "telephone": "+22670123456",
  "motDePasse": "password123",
  "carteIdentite": "BF123456789"
}
```

### D. Changer Mot de Passe
```
PUT /api/auth/changer-mot-de-passe
Headers: X-User-Id: {userId}
```

**Request:**
```json
{
  "ancienMotDePasse": "oldpass",
  "nouveauMotDePasse": "newpass"
}
```

---

## 7️⃣ CATÉGORIES

### A. Lister Catégories (Public)
```
GET /api/public/categories
```

**Response:**
```json
[
  {
    "id": "cat-1",
    "nom": "Électronique",
    "description": "Smartphones, ordinateurs, etc.",
    "icone": "📱"
  },
  {
    "id": "cat-2",
    "nom": "Mode",
    "description": "Vêtements et accessoires",
    "icone": "👕"
  }
]
```

### B. Produits par Catégorie
```
GET /api/public/categories/{id}/produits?page=0&size=20
```

### C. Créer Catégorie (Admin)
```
POST /api/admin/categories/creer
Headers: X-User-Id: {adminId}
```

**Request:**
```json
{
  "nom": "Électronique",
  "description": "Appareils électroniques",
  "icone": "📱"
}
```

---

## 8️⃣ RECHERCHE

### Recherche Globale
```
GET /api/public/recherche?q=iphone&type=produits
```

**Paramètres:**
- `q`: Terme de recherche
- `type`: `produits`, `boutiques`, ou vide pour tout

**Response:**
```json
{
  "produits": [...],
  "boutiques": [...]
}
```

---

## 9️⃣ DASHBOARD

### A. Dashboard Client
```
GET /api/client/dashboard
Headers: X-User-Id: {clientId}
```

**Response:**
```json
{
  "commandesEnCours": 3,
  "commandesLivrees": 15,
  "totalDepense": 450000,
  "dernieresCommandes": [...]
}
```

### B. Dashboard Vendeur
```
GET /api/vendeur/dashboard
Headers: X-User-Id: {vendeurId}
```

**Response:**
```json
{
  "produitsActifs": 25,
  "commandesEnAttente": 5,
  "ventesAujourdhui": 125000,
  "ventesMois": 850000,
  "produitsStockFaible": [...]
}
```

### C. Dashboard Admin
```
GET /api/admin/dashboard
Headers: X-User-Id: {adminId}
```

---

## 🔟 NOTIFICATIONS

### A. Récupérer Notifications
```
GET /api/client/notifications
Headers: X-User-Id: {userId}
```

**Response:**
```json
[
  {
    "id": "notif-1",
    "titre": "Commande livrée",
    "message": "Votre commande CMD-001 a été livrée",
    "type": "COMMANDE",
    "lue": false,
    "dateCreation": "2024-01-15T10:30:00"
  }
]
```

### B. Marquer comme Lue
```
PUT /api/client/notifications/{id}/lue
Headers: X-User-Id: {userId}
```

### C. Compteur Notifications
```
GET /api/client/notifications/compteur
Headers: X-User-Id: {userId}
```

**Response:**
```json
{
  "nonLues": 5
}
```

---

## 1️⃣1️⃣ VALIDATION BACKEND

### Contraintes de Validation
```java
public class CreerProduitRequest {
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 3, max = 200, message = "Le nom doit contenir entre 3 et 200 caractères")
    private String nom;
    
    @NotBlank(message = "La description est obligatoire")
    @Size(min = 10, max = 2000, message = "La description doit contenir entre 10 et 2000 caractères")
    private String description;
    
    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix doit être positif")
    @DecimalMax(value = "999999999.99", message = "Prix trop élevé")
    private BigDecimal prix;
    
    @NotNull(message = "Le stock est obligatoire")
    @Min(value = 0, message = "Le stock doit être positif")
    @Max(value = 999999, message = "Stock trop élevé")
    private Integer stock;
    
    @NotBlank(message = "La catégorie est obligatoire")
    private String categorieId;
    
    @Size(max = 10, message = "Maximum 10 images")
    private List<String> images;
}
```

---

## 1️⃣2️⃣ GESTION D'ERREURS

### Format de Réponse d'Erreur
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation échouée",
  "errors": {
    "nom": "Le nom est obligatoire",
    "prix": "Le prix doit être positif"
  }
}
```

### Exception Handler
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
        response.put("timestamp", LocalDateTime.now());
        response.put("status", 400);
        response.put("error", "Bad Request");
        response.put("message", "Validation échouée");
        response.put("errors", errors);
        
        return ResponseEntity.badRequest().body(response);
    }
}
```

---

## 1️⃣3️⃣ SÉCURITÉ

### CORS Configuration
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
                        .exposedHeaders("X-User-Id")
                        .allowCredentials(true);
            }
        };
    }
}
```

---

## 1️⃣4️⃣ CHECKLIST D'IMPLÉMENTATION

### Endpoints Critiques
- [x] POST /api/upload/image
- [x] POST /api/vendeur/produits/creer
- [x] PUT /api/vendeur/produits/{id}
- [x] DELETE /api/vendeur/produits/{id}
- [x] GET /api/vendeur/produits
- [x] GET /api/vendeur/produits/{id}
- [x] GET /api/public/produits/{id}
- [x] POST /api/client/panier/ajouter
- [x] GET /api/client/panier
- [x] DELETE /api/client/panier/{itemId}
- [x] POST /api/client/commandes/creer
- [x] GET /api/client/historique-commandes
- [x] GET /api/vendeur/commandes
- [x] PUT /api/vendeur/commandes/{id}/statut

### Fonctionnalités
- [x] Upload d'images avec validation
- [x] Gestion complète des produits avec détails
- [x] Panier avec stockage local + backend
- [x] Système de commandes
- [x] Authentification JWT
- [x] Validation des données
- [x] Gestion d'erreurs
- [x] CORS configuré

---

**Ce document contient TOUTES les spécifications nécessaires pour implémenter le backend complet de FasoMarket! 🚀**
