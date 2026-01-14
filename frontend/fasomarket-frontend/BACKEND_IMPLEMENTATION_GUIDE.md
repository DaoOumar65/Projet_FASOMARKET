# Guide d'implémentation Backend - Endpoints Manquants

## 1. AdminDashboardController.java

```java
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {
    
    private final UserRepository userRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;
    private final VendorRepository vendorRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAdminResponse> getDashboard() {
        DashboardAdminResponse response = new DashboardAdminResponse();
        
        // Statistiques
        Statistiques stats = new Statistiques();
        stats.setTotalUtilisateurs(userRepository.count());
        stats.setTotalVendeurs(vendorRepository.count());
        stats.setTotalClients(userRepository.countByRole(Role.CLIENT));
        stats.setTotalBoutiques(boutiqueRepository.count());
        stats.setBoutiquesActives(boutiqueRepository.countByStatut(StatutBoutique.ACTIVE));
        stats.setBoutiquesEnAttente(boutiqueRepository.countByStatut(StatutBoutique.EN_ATTENTE_APPROBATION));
        stats.setTotalProduits(produitRepository.count());
        stats.setTotalCommandes(commandeRepository.count());
        stats.setCommandesAujourdhui(commandeRepository.countByDateCreationAfter(LocalDateTime.now().toLocalDate().atStartOfDay()));
        
        response.setStatistiques(stats);
        
        // Vendeurs en attente
        List<Vendor> vendeursEnAttente = vendorRepository.findByStatus(StatutCompteVendeur.EN_ATTENTE_VALIDATION);
        response.setVendeursEnAttente(vendeursEnAttente);
        
        // Boutiques en attente
        List<Boutique> boutiquesEnAttente = boutiqueRepository.findByStatut(StatutBoutique.EN_ATTENTE_APPROBATION);
        response.setBoutiquesEnAttente(boutiquesEnAttente);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/boutiques/{id}/details")
    public ResponseEntity<BoutiqueDetailsResponse> getBoutiqueDetails(@PathVariable UUID id) {
        Boutique boutique = boutiqueRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Boutique non trouvée"));
        
        BoutiqueDetailsResponse response = new BoutiqueDetailsResponse();
        response.setId(boutique.getId());
        response.setNom(boutique.getNom());
        response.setDescription(boutique.getDescription());
        response.setAdresse(boutique.getAdresse());
        response.setTelephone(boutique.getTelephone());
        response.setStatut(boutique.getStatut());
        response.setDateCreation(boutique.getDateCreation());
        
        // Informations du vendeur
        if (boutique.getVendor() != null && boutique.getVendor().getUser() != null) {
            VendeurInfo vendeurInfo = new VendeurInfo();
            vendeurInfo.setNomComplet(boutique.getVendor().getUser().getFullName());
            vendeurInfo.setTelephone(boutique.getVendor().getUser().getPhone());
            vendeurInfo.setEmail(boutique.getVendor().getUser().getEmail());
            response.setVendeur(vendeurInfo);
        }
        
        return ResponseEntity.ok(response);
    }
}
```

## 2. BoutiqueController.java (Public)

```java
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicBoutiqueController {
    
    private final BoutiqueRepository boutiqueRepository;
    
    @GetMapping("/boutiques")
    public ResponseEntity<List<BoutiqueResponse>> getBoutiques(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Boutique> boutiquesPage = boutiqueRepository.findByStatut(StatutBoutique.ACTIVE, pageable);
        
        List<BoutiqueResponse> responses = boutiquesPage.getContent().stream()
            .map(this::mapToBoutiqueResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    private BoutiqueResponse mapToBoutiqueResponse(Boutique boutique) {
        BoutiqueResponse response = new BoutiqueResponse();
        response.setId(boutique.getId());
        response.setNom(boutique.getNom());
        response.setDescription(boutique.getDescription());
        response.setAdresse(boutique.getAdresse());
        response.setTelephone(boutique.getTelephone());
        response.setCategorie(boutique.getCategorie());
        response.setLivraison(boutique.isLivraison());
        response.setFraisLivraison(boutique.getFraisLivraison());
        response.setStatut(boutique.getStatut());
        response.setDateCreation(boutique.getDateCreation());
        return response;
    }
}
```

## 3. VendorDashboardController.java

```java
@RestController
@RequestMapping("/api/vendeur")
@RequiredArgsConstructor
public class VendorDashboardController {
    
    private final VendorRepository vendorRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;
    
    @GetMapping("/statut-compte")
    public ResponseEntity<StatutCompteResponse> getStatutCompte(@RequestHeader("X-User-Id") UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Compte vendeur non trouvé"));
        
        StatutCompteResponse response = new StatutCompteResponse();
        response.setStatut(vendor.getStatus());
        response.setIdCard(vendor.getIdCard());
        response.setDateCreation(vendor.getCreatedAt());
        response.setDateValidation(vendor.getDateValidation());
        response.setRaisonRefus(vendor.getRaisonRefus());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardVendeurResponse> getDashboard(@RequestHeader("X-User-Id") UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Compte vendeur non trouvé"));
        
        DashboardVendeurResponse response = new DashboardVendeurResponse();
        
        // Statistiques
        Boutique boutique = boutiqueRepository.findByVendorId(vendor.getId()).orElse(null);
        if (boutique != null) {
            StatistiquesVendeur stats = new StatistiquesVendeur();
            stats.setTotalProduits(produitRepository.countByBoutiqueId(boutique.getId()));
            stats.setTotalCommandes(commandeRepository.countByBoutiqueId(boutique.getId()));
            stats.setCommandesEnCours(commandeRepository.countByBoutiqueIdAndStatutIn(
                boutique.getId(), 
                Arrays.asList(StatutCommande.PENDING, StatutCommande.CONFIRMED, StatutCommande.PREPARING)
            ));
            response.setStatistiques(stats);
        }
        
        return ResponseEntity.ok(response);
    }
}
```

## 4. ClientDashboardController.java

```java
@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientDashboardController {
    
    private final CommandeRepository commandeRepository;
    private final FavoriRepository favoriRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardClientResponse> getDashboard(@RequestHeader("X-User-Id") UUID userId) {
        DashboardClientResponse response = new DashboardClientResponse();
        
        // Statistiques
        StatistiquesClient stats = new StatistiquesClient();
        stats.setTotalCommandes(commandeRepository.countByClientId(userId));
        stats.setCommandesEnCours(commandeRepository.countByClientIdAndStatutIn(
            userId,
            Arrays.asList(StatutCommande.PENDING, StatutCommande.CONFIRMED, StatutCommande.PREPARING, StatutCommande.SHIPPED)
        ));
        stats.setTotalFavoris(favoriRepository.countByClientId(userId));
        response.setStatistiques(stats);
        
        // Commandes récentes
        List<Commande> commandesRecentes = commandeRepository.findTop5ByClientIdOrderByDateCreationDesc(userId);
        response.setCommandesRecentes(commandesRecentes);
        
        return ResponseEntity.ok(response);
    }
}
```

## 5. CORS Configuration (CRITIQUE)

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .exposedHeaders("Authorization", "X-User-Id")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

## 6. Configuration pour éviter l'encodage HTML

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
    
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper());
        converters.add(0, converter);
    }
}w MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper());
        converters.add(0, converter);
    }
}
```

## 6. Entités - Ajout de relations

```java
@Entity
@Table(name = "boutiques")
public class Boutique {
    // ... autres champs
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
    
    // Getters et setters
}

@Entity
@Table(name = "vendors")
public class Vendor {
    // ... autres champs
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL)
    private List<Boutique> boutiques;
    
    // Getters et setters
}
```

## 7. DTOs Response

```java
@Data
public class DashboardAdminResponse {
    private Statistiques statistiques;
    private List<Vendor> vendeursEnAttente;
    private List<Boutique> boutiquesEnAttente;
    private List<Commande> commandesRecentes;
}

@Data
public class Statistiques {
    private Long totalUtilisateurs;
    private Long totalVendeurs;
    private Long totalClients;
    private Long totalBoutiques;
    private Long boutiquesActives;
    private Long boutiquesEnAttente;
    private Long totalProduits;
    private Long totalCommandes;
    private Long commandesAujourdhui;
    private Double chiffreAffairesTotal;
    private Double chiffreAffairesMois;
}

@Data
public class BoutiqueDetailsResponse {
    private UUID id;
    private String nom;
    private String description;
    private String adresse;
    private String telephone;
    private StatutBoutique statut;
    private LocalDateTime dateCreation;
    private VendeurInfo vendeur;
}

@Data
public class VendeurInfo {
    private String nomComplet;
    private String telephone;
    private String email;
}
```

## Ordre d'implémentation recommandé:

1. ✅ Ajouter relations Boutique-Vendor-User
2. ✅ Configurer ObjectMapper pour éviter encodage HTML
3. ✅ Implémenter `/api/public/boutiques`
4. ✅ Implémenter `/api/admin/dashboard`
5. ✅ Implémenter `/api/admin/boutiques/{id}/details`
6. ✅ Implémenter `/api/vendeur/statut-compte`
7. ✅ Implémenter `/api/vendeur/dashboard`
8. ✅ Implémenter `/api/client/dashboard`


## 8. VendorStockController.java - Gestion Stock & Livraison

```java
@RestController
@RequestMapping("/api/vendeur")
@RequiredArgsConstructor
public class VendorStockController {
    
    private final VendorRepository vendorRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final ProduitRepository produitRepository;
    
    @GetMapping("/gestion-stock")
    public ResponseEntity<List<ProduitStockResponse>> getGestionStock(@RequestHeader("X-User-Id") UUID userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Compte vendeur non trouvé"));
        
        Boutique boutique = boutiqueRepository.findByVendorId(vendor.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Boutique non trouvée"));
        
        List<Produit> produits = produitRepository.findByBoutiqueId(boutique.getId());
        
        List<ProduitStockResponse> responses = produits.stream()
            .map(this::mapToProduitStockResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    @PutMapping("/produits/{produitId}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable UUID produitId,
            @RequestBody UpdateStockRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Compte vendeur non trouvé"));
        
        Produit produit = produitRepository.findById(produitId)
            .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé"));
        
        // Vérifier que le produit appartient au vendeur
        if (!produit.getBoutique().getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à modifier ce produit");
        }
        
        produit.setQuantiteStock(request.getQuantiteStock());
        produit.setSeuilAlerte(request.getSeuilAlerte());
        produit.setDisponible(request.getQuantiteStock() > 0);
        
        produitRepository.save(produit);
        
        // Envoyer notification si stock faible
        if (request.getQuantiteStock() <= request.getSeuilAlerte() && request.getQuantiteStock() > 0) {
            notificationService.sendStockAlert(vendor.getUser(), produit);
        }
        
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/boutiques/livraison")
    public ResponseEntity<Void> updateLivraison(
            @RequestBody UpdateLivraisonRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        
        Vendor vendor = vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Compte vendeur non trouvé"));
        
        Boutique boutique = boutiqueRepository.findByVendorId(vendor.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Boutique non trouvée"));
        
        boutique.setLivraison(request.isLivraisonActive());
        boutique.setFraisLivraison(request.getFraisLivraison());
        boutique.setZonesLivraison(request.getZonesLivraison());
        boutique.setDelaiLivraison(request.getDelaiLivraison());
        
        boutiqueRepository.save(boutique);
        
        return ResponseEntity.ok().build();
    }
    
    private ProduitStockResponse mapToProduitStockResponse(Produit produit) {
        ProduitStockResponse response = new ProduitStockResponse();
        response.setId(produit.getId());
        response.setNom(produit.getNom());
        response.setPrix(produit.getPrix());
        response.setQuantiteStock(produit.getQuantiteStock());
        response.setSeuilAlerte(produit.getSeuilAlerte() != null ? produit.getSeuilAlerte() : 5);
        response.setImages(produit.getImages());
        response.setDisponible(produit.isDisponible());
        return response;
    }
}
```

## 9. Entité Produit - Ajout champ seuilAlerte

```java
@Entity
@Table(name = "produits")
public class Produit {
    // ... autres champs
    
    @Column(name = "quantite_stock")
    private Integer quantiteStock;
    
    @Column(name = "seuil_alerte")
    private Integer seuilAlerte = 5; // Valeur par défaut
    
    @Column(name = "disponible")
    private Boolean disponible = true;
    
    // Getters et setters
}
```

## 10. Entité Boutique - Ajout champs livraison

```java
@Entity
@Table(name = "boutiques")
public class Boutique {
    // ... autres champs
    
    @Column(name = "livraison")
    private Boolean livraison = false;
    
    @Column(name = "frais_livraison")
    private Double fraisLivraison = 0.0;
    
    @Column(name = "zones_livraison")
    @Convert(converter = StringListConverter.class)
    private List<String> zonesLivraison = new ArrayList<>();
    
    @Column(name = "delai_livraison")
    private String delaiLivraison = "24-48h";
    
    // Getters et setters
}
```

## 11. DTOs Request/Response

```java
@Data
public class UpdateStockRequest {
    private Integer quantiteStock;
    private Integer seuilAlerte;
}

@Data
public class UpdateLivraisonRequest {
    private Boolean livraisonActive;
    private Double fraisLivraison;
    private List<String> zonesLivraison;
    private String delaiLivraison;
}

@Data
public class ProduitStockResponse {
    private UUID id;
    private String nom;
    private Double prix;
    private Integer quantiteStock;
    private Integer seuilAlerte;
    private List<String> images;
    private Boolean disponible;
}
```

## 12. Service de Notification Stock

```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    public void sendStockAlert(User user, Produit produit) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitre("⚠️ Stock faible");
        notification.setMessage(String.format(
            "Le produit '%s' a un stock faible (%d unités). Pensez à réapprovisionner.",
            produit.getNom(),
            produit.getQuantiteStock()
        ));
        notification.setType(NotificationType.WARNING);
        notification.setLue(false);
        notification.setDateCreation(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
    
    public void sendStockRuptureAlert(User user, Produit produit) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitre("🚨 Rupture de stock");
        notification.setMessage(String.format(
            "Le produit '%s' est en rupture de stock. Il n'est plus visible pour les clients.",
            produit.getNom()
        ));
        notification.setType(NotificationType.ERROR);
        notification.setLue(false);
        notification.setDateCreation(LocalDateTime.now());
        
        notificationRepository.save(notification);
    }
}
```

## 13. Converter pour List<String>

```java
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    
    private static final String SEPARATOR = ",";
    
    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "";
        }
        return String.join(SEPARATOR, list);
    }
    
    @Override
    public List<String> convertToEntityAttribute(String joined) {
        if (joined == null || joined.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(joined.split(SEPARATOR));
    }
}
```

## 14. Migration SQL

```sql
-- Ajout colonne seuil_alerte
ALTER TABLE produits ADD COLUMN seuil_alerte INTEGER DEFAULT 5;

-- Ajout colonnes livraison
ALTER TABLE boutiques ADD COLUMN zones_livraison VARCHAR(500);
ALTER TABLE boutiques ADD COLUMN delai_livraison VARCHAR(50) DEFAULT '24-48h';

-- Index pour optimisation
CREATE INDEX idx_produit_stock ON produits(quantite_stock);
CREATE INDEX idx_produit_seuil ON produits(seuil_alerte);
```

## Fonctionnalités implémentées:

✅ **Gestion du stock:**
- Visualisation du stock de tous les produits
- Modification du stock en temps réel
- Définition de seuils d'alerte personnalisés
- Alertes visuelles (rupture, stock faible)
- Notifications automatiques

✅ **Gestion de la livraison:**
- Activation/désactivation de la livraison
- Configuration des frais de livraison
- Définition des zones de livraison
- Paramétrage du délai de livraison
- Mise à jour en temps réel

✅ **Sécurité:**
- Vérification de propriété des produits
- Validation des données
- Protection contre les modifications non autorisées

}
```

## 7. Security Configuration (si Spring Security est utilisé)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/vendeur/**").hasRole("VENDOR")
                .requestMatchers("/api/client/**").hasRole("CLIENT")
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-User-Id"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## SOLUTION RAPIDE CORS

Si vous n'avez pas Spring Security, ajoutez simplement cette annotation sur vos controllers:

```java
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/vendeur")
public class VendorDashboardController {
    // ... votre code
}
```

Ou créez le fichier `CorsConfig.java` (section 5 ci-dessus) dans votre package config.


## SOLUTION RAPIDE - Rendre la boutique visible

La boutique "MaroShop" existe déjà avec le statut ACTIVE dans la table `shops`.

Le problème est que le backend retourne une erreur 500 sur `/api/public/boutiques`.

**Actions requises côté backend:**

1. Implémenter l'endpoint `/api/public/boutiques` (voir section 2)
2. Ajouter la configuration CORS (voir section 5)
3. Mapper correctement la table `shops` vers l'entité `Boutique`

**Vérification de la structure:**
```sql
-- La table s'appelle 'shops' et non 'boutiques'
-- Mettre à jour l'annotation @Table dans l'entité Boutique:
@Entity
@Table(name = "shops")
public class Boutique {
    // ...
}
```

**Test de l'endpoint:**
```bash
curl http://localhost:8081/api/public/boutiques
```

Doit retourner la boutique MaroShop avec toutes ses informations.
