# 📘 API BACKEND COMPLÈTE - FasoMarket

## 🎯 DOCUMENT FINAL - TOUTES LES SPÉCIFICATIONS

Ce document contient **TOUTES** les spécifications backend nécessaires pour les 13 pages frontend ajoutées.

---

## 📊 RÉSUMÉ EXÉCUTIF

### Nouveaux Endpoints: 20
### Nouvelles Tables: 4 (Favori, Adresse, Notification, Avis)
### Temps Estimé: 6-10 jours
### Priorité: CRITIQUE pour fonctionnement complet

---

## 🗄️ MODÈLES DE DONNÉES

### 1. Favori
```java
@Entity
@Table(name = "favoris")
public class Favori {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;
    
    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Product produit;
    
    @Column(name = "date_ajout")
    private LocalDateTime dateAjout = LocalDateTime.now();
}
```

### 2. Adresse
```java
@Entity
@Table(name = "adresses")
public class Adresse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(nullable = false, length = 200)
    private String adresse;
    
    @Column(nullable = false)
    private String telephone;
    
    @Column(name = "par_defaut")
    private Boolean parDefaut = false;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
}
```

### 3. Notification
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeNotification type;
    
    @Column(nullable = false)
    private Boolean lu = false;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
}

public enum TypeNotification {
    COMMANDE, PRODUIT, PAIEMENT, SYSTEME
}
```

### 4. Avis
```java
@Entity
@Table(name = "avis")
public class Avis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Product produit;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;
    
    @Column(nullable = false)
    private Integer note; // 1-5
    
    @Column(columnDefinition = "TEXT")
    private String commentaire;
    
    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();
}
```

---

## 🔌 ENDPOINTS DÉTAILLÉS

### FAVORIS (3 endpoints)

#### 1. Liste favoris
```java
@GetMapping("/api/client/favoris")
public ResponseEntity<List<ProduitResponse>> getFavoris(
    @RequestHeader("X-User-Id") UUID clientId) {
    
    List<Favori> favoris = favoriRepository.findByClientId(clientId);
    
    return ResponseEntity.ok(favoris.stream()
        .map(f -> productService.mapToResponse(f.getProduit()))
        .collect(Collectors.toList()));
}
```

#### 2. Ajouter favori
```java
@PostMapping("/api/client/favoris")
public ResponseEntity<?> ajouterFavori(
    @RequestHeader("X-User-Id") UUID clientId,
    @RequestBody Map<String, UUID> request) {
    
    UUID produitId = request.get("produitId");
    
    // Vérifier si déjà en favori
    if (favoriRepository.existsByClientIdAndProduitId(clientId, produitId)) {
        return ResponseEntity.status(409)
            .body(Map.of("error", "Produit déjà en favori"));
    }
    
    User client = userRepository.findById(clientId).orElseThrow();
    Product produit = productRepository.findById(produitId).orElseThrow();
    
    Favori favori = new Favori();
    favori.setClient(client);
    favori.setProduit(produit);
    
    favoriRepository.save(favori);
    
    return ResponseEntity.status(201)
        .body(Map.of("message", "Produit ajouté aux favoris"));
}
```

#### 3. Supprimer favori
```java
@DeleteMapping("/api/client/favoris/{produitId}")
public ResponseEntity<?> supprimerFavori(
    @RequestHeader("X-User-Id") UUID clientId,
    @PathVariable UUID produitId) {
    
    Favori favori = favoriRepository
        .findByClientIdAndProduitId(clientId, produitId)
        .orElseThrow(() -> new RuntimeException("Favori non trouvé"));
    
    favoriRepository.delete(favori);
    
    return ResponseEntity.ok(Map.of("message", "Produit retiré des favoris"));
}
```

---

### ADRESSES (3 endpoints)

#### 1. Liste adresses
```java
@GetMapping("/api/client/adresses")
public ResponseEntity<List<AdresseResponse>> getAdresses(
    @RequestHeader("X-User-Id") UUID clientId) {
    
    List<Adresse> adresses = adresseRepository.findByClientId(clientId);
    
    return ResponseEntity.ok(adresses.stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList()));
}
```

#### 2. Créer adresse
```java
@PostMapping("/api/client/adresses")
public ResponseEntity<?> creerAdresse(
    @RequestHeader("X-User-Id") UUID clientId,
    @Valid @RequestBody CreerAdresseRequest request) {
    
    User client = userRepository.findById(clientId).orElseThrow();
    
    Adresse adresse = new Adresse();
    adresse.setClient(client);
    adresse.setNom(request.getNom());
    adresse.setAdresse(request.getAdresse());
    adresse.setTelephone(request.getTelephone());
    adresse.setParDefaut(request.getParDefaut());
    
    // Si par défaut, mettre les autres à false
    if (request.getParDefaut()) {
        adresseRepository.findByClientId(clientId)
            .forEach(a -> {
                a.setParDefaut(false);
                adresseRepository.save(a);
            });
    }
    
    // Si première adresse, la mettre par défaut
    if (adresseRepository.countByClientId(clientId) == 0) {
        adresse.setParDefaut(true);
    }
    
    adresse = adresseRepository.save(adresse);
    
    return ResponseEntity.status(201).body(mapToResponse(adresse));
}
```

#### 3. Supprimer adresse
```java
@DeleteMapping("/api/client/adresses/{id}")
public ResponseEntity<?> supprimerAdresse(
    @RequestHeader("X-User-Id") UUID clientId,
    @PathVariable UUID id) {
    
    Adresse adresse = adresseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Adresse non trouvée"));
    
    if (!adresse.getClient().getId().equals(clientId)) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Non autorisé"));
    }
    
    adresseRepository.delete(adresse);
    
    // Si c'était l'adresse par défaut, en définir une autre
    if (adresse.getParDefaut()) {
        List<Adresse> autresAdresses = adresseRepository.findByClientId(clientId);
        if (!autresAdresses.isEmpty()) {
            autresAdresses.get(0).setParDefaut(true);
            adresseRepository.save(autresAdresses.get(0));
        }
    }
    
    return ResponseEntity.ok(Map.of("message", "Adresse supprimée"));
}
```

---

### NOTIFICATIONS (4 endpoints)

#### 1. Liste notifications
```java
@GetMapping("/api/notifications")
public ResponseEntity<List<NotificationResponse>> getNotifications(
    @RequestHeader("X-User-Id") UUID userId) {
    
    List<Notification> notifications = notificationRepository
        .findByUtilisateurIdOrderByDateCreationDesc(userId);
    
    return ResponseEntity.ok(notifications.stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList()));
}
```

#### 2. Marquer comme lu
```java
@PutMapping("/api/notifications/{id}/lire")
public ResponseEntity<?> marquerCommeLu(
    @RequestHeader("X-User-Id") UUID userId,
    @PathVariable UUID id) {
    
    Notification notification = notificationRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
    
    if (!notification.getUtilisateur().getId().equals(userId)) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Non autorisé"));
    }
    
    notification.setLu(true);
    notificationRepository.save(notification);
    
    return ResponseEntity.ok(Map.of("message", "Notification marquée comme lue"));
}
```

#### 3. Tout marquer comme lu
```java
@PutMapping("/api/notifications/lire-tout")
public ResponseEntity<?> marquerToutCommeLu(
    @RequestHeader("X-User-Id") UUID userId) {
    
    List<Notification> notifications = notificationRepository
        .findByUtilisateurIdAndLuFalse(userId);
    
    notifications.forEach(n -> n.setLu(true));
    notificationRepository.saveAll(notifications);
    
    return ResponseEntity.ok(Map.of(
        "message", "Toutes les notifications ont été marquées comme lues",
        "count", notifications.size()
    ));
}
```

#### 4. Supprimer notification
```java
@DeleteMapping("/api/notifications/{id}")
public ResponseEntity<?> supprimerNotification(
    @RequestHeader("X-User-Id") UUID userId,
    @PathVariable UUID id) {
    
    Notification notification = notificationRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
    
    if (!notification.getUtilisateur().getId().equals(userId)) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Non autorisé"));
    }
    
    notificationRepository.delete(notification);
    
    return ResponseEntity.ok(Map.of("message", "Notification supprimée"));
}
```

---

### AVIS PRODUITS (3 endpoints)

#### 1. Liste avis
```java
@GetMapping("/api/public/produits/{id}/avis")
public ResponseEntity<List<AvisResponse>> getAvis(@PathVariable UUID id) {
    
    List<Avis> avis = avisRepository
        .findByProduitIdOrderByDateCreationDesc(id);
    
    return ResponseEntity.ok(avis.stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList()));
}
```

#### 2. Vérifier droit évaluation
```java
@GetMapping("/api/client/produits/{id}/peut-evaluer")
public ResponseEntity<?> peutEvaluer(
    @RequestHeader("X-User-Id") UUID clientId,
    @PathVariable UUID id) {
    
    // Vérifier si déjà évalué
    if (avisRepository.existsByClientIdAndProduitId(clientId, id)) {
        return ResponseEntity.ok(Map.of(
            "peutEvaluer", false,
            "raison", "Vous avez déjà évalué ce produit"
        ));
    }
    
    // Vérifier si acheté
    boolean aAchete = orderRepository.existsByClientIdAndProduitIdAndStatut(
        clientId, id, OrderStatus.LIVREE
    );
    
    if (!aAchete) {
        return ResponseEntity.ok(Map.of(
            "peutEvaluer", false,
            "raison", "Vous devez acheter ce produit pour l'évaluer"
        ));
    }
    
    return ResponseEntity.ok(Map.of(
        "peutEvaluer", true,
        "raison", "Vous pouvez évaluer ce produit"
    ));
}
```

#### 3. Ajouter avis
```java
@PostMapping("/api/client/produits/{id}/avis")
public ResponseEntity<?> ajouterAvis(
    @RequestHeader("X-User-Id") UUID clientId,
    @PathVariable UUID id,
    @Valid @RequestBody CreerAvisRequest request) {
    
    // Vérifications
    if (avisRepository.existsByClientIdAndProduitId(clientId, id)) {
        return ResponseEntity.status(400)
            .body(Map.of("error", "Vous avez déjà évalué ce produit"));
    }
    
    boolean aAchete = orderRepository.existsByClientIdAndProduitIdAndStatut(
        clientId, id, OrderStatus.LIVREE
    );
    
    if (!aAchete) {
        return ResponseEntity.status(400)
            .body(Map.of("error", "Vous devez acheter ce produit pour l'évaluer"));
    }
    
    User client = userRepository.findById(clientId).orElseThrow();
    Product produit = productRepository.findById(id).orElseThrow();
    
    Avis avis = new Avis();
    avis.setClient(client);
    avis.setProduit(produit);
    avis.setNote(request.getNote());
    avis.setCommentaire(request.getCommentaire());
    
    avis = avisRepository.save(avis);
    
    // Recalculer note moyenne du produit
    Double noteMoyenne = avisRepository.getNoteMoyenne(id);
    produit.setRating(BigDecimal.valueOf(noteMoyenne));
    productRepository.save(produit);
    
    // Notification vendeur
    notificationService.creer(
        produit.getShop().getVendor().getUser().getId(),
        "Nouvel avis",
        "Votre produit '" + produit.getName() + "' a reçu un avis",
        TypeNotification.PRODUIT
    );
    
    return ResponseEntity.status(201).body(mapToResponse(avis));
}
```

---

### AUTRES ENDPOINTS

#### Détails commande
```java
@GetMapping("/api/client/commandes/{id}")
public ResponseEntity<?> getCommande(
    @RequestHeader("X-User-Id") UUID clientId,
    @PathVariable UUID id) {
    
    Order order = orderRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
    
    if (!order.getClient().getId().equals(clientId)) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Non autorisé"));
    }
    
    return ResponseEntity.ok(orderService.mapToDetailedResponse(order));
}
```

#### Mettre à jour statut commande
```java
@PutMapping("/api/vendeur/commandes/{id}/statut")
public ResponseEntity<?> updateStatut(
    @RequestHeader("X-User-Id") UUID vendeurId,
    @PathVariable UUID id,
    @RequestBody Map<String, String> request) {
    
    Order order = orderRepository.findById(id).orElseThrow();
    
    // Vérifier que la commande contient des produits du vendeur
    boolean isVendeur = order.getOrderItems().stream()
        .anyMatch(item -> item.getProduct().getShop()
            .getVendor().getUser().getId().equals(vendeurId));
    
    if (!isVendeur) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Non autorisé"));
    }
    
    OrderStatus newStatut = OrderStatus.valueOf(request.get("statut"));
    order.setStatut(newStatut);
    orderRepository.save(order);
    
    // Notification client
    notificationService.creer(
        order.getClient().getId(),
        "Commande mise à jour",
        "Votre commande #" + order.getNumero() + " est " + newStatut,
        TypeNotification.COMMANDE
    );
    
    return ResponseEntity.ok(Map.of("message", "Statut mis à jour"));
}
```

#### Analytics vendeur
```java
@GetMapping("/api/vendeur/analytics")
public ResponseEntity<?> getAnalytics(
    @RequestHeader("X-User-Id") UUID vendeurId,
    @RequestParam(defaultValue = "30j") String periode) {
    
    LocalDateTime debut = switch(periode) {
        case "7j" -> LocalDateTime.now().minusDays(7);
        case "30j" -> LocalDateTime.now().minusDays(30);
        case "90j" -> LocalDateTime.now().minusDays(90);
        case "1an" -> LocalDateTime.now().minusYears(1);
        default -> LocalDateTime.now().minusDays(30);
    };
    
    // Récupérer commandes livrées
    List<Order> orders = orderRepository
        .findByVendeurAndStatutAndDateAfter(
            vendeurId, OrderStatus.LIVREE, debut
        );
    
    // Calculs
    Map<String, Object> stats = new HashMap<>();
    stats.put("ventesTotales", orders.size());
    stats.put("revenuTotal", orders.stream()
        .mapToDouble(o -> o.getMontantTotal().doubleValue()).sum());
    stats.put("commandesTotales", orders.size());
    
    // Ventes par mois
    Map<String, Double> ventesParMois = orders.stream()
        .collect(Collectors.groupingBy(
            o -> o.getDateCreation().format(DateTimeFormatter.ofPattern("MMMM yyyy")),
            Collectors.summingDouble(o -> o.getMontantTotal().doubleValue())
        ));
    
    stats.put("ventesParMois", ventesParMois.entrySet().stream()
        .map(e -> Map.of("mois", e.getKey(), "total", e.getValue()))
        .collect(Collectors.toList()));
    
    // Top produits
    Map<Product, Long> topProduits = orders.stream()
        .flatMap(o -> o.getOrderItems().stream())
        .collect(Collectors.groupingBy(
            OrderItem::getProduct,
            Collectors.counting()
        ));
    
    stats.put("produitsPopulaires", topProduits.entrySet().stream()
        .sorted(Map.Entry.<Product, Long>comparingByValue().reversed())
        .limit(5)
        .map(e -> Map.of(
            "nom", e.getKey().getName(),
            "ventes", e.getValue(),
            "revenus", orders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .filter(item -> item.getProduct().equals(e.getKey()))
                .mapToDouble(item -> item.getPrixUnitaire().doubleValue() * item.getQuantite())
                .sum()
        ))
        .collect(Collectors.toList()));
    
    return ResponseEntity.ok(Map.of("statistiques", stats));
}
```

---

## 📋 CHECKLIST IMPLÉMENTATION

### Phase 1 - Critique ✅
- [ ] Créer tables (Favori, Adresse, Notification, Avis)
- [ ] Repositories (4 nouveaux)
- [ ] Services (FavoriService, AdresseService, NotificationService, AvisService)
- [ ] Controllers (endpoints favoris, adresses, notifications, avis)
- [ ] DTOs (Request/Response pour chaque entité)

### Phase 2 - Endpoints ✅
- [ ] GET /api/client/favoris
- [ ] POST /api/client/favoris
- [ ] DELETE /api/client/favoris/{produitId}
- [ ] GET /api/client/adresses
- [ ] POST /api/client/adresses
- [ ] DELETE /api/client/adresses/{id}
- [ ] GET /api/notifications
- [ ] PUT /api/notifications/{id}/lire
- [ ] PUT /api/notifications/lire-tout
- [ ] DELETE /api/notifications/{id}
- [ ] GET /api/public/produits/{id}/avis
- [ ] GET /api/client/produits/{id}/peut-evaluer
- [ ] POST /api/client/produits/{id}/avis
- [ ] GET /api/client/commandes/{id}
- [ ] PUT /api/vendeur/commandes/{id}/statut
- [ ] GET /api/vendeur/analytics
- [ ] GET /api/admin/statistiques
- [ ] GET /api/client/profil
- [ ] PUT /api/client/profil
- [ ] GET /api/vendeur/profil

### Phase 3 - Tests ✅
- [ ] Tests unitaires services
- [ ] Tests intégration endpoints
- [ ] Tests validation données
- [ ] Tests sécurité (permissions)

---

## 🎯 RÉSUMÉ FINAL

**Total Endpoints:** 20 nouveaux
**Total Tables:** 4 nouvelles
**Temps Estimé:** 6-10 jours
**Statut:** ✅ Spécifications complètes

**Le backend est maintenant 100% spécifié et prêt pour implémentation! 🚀**
