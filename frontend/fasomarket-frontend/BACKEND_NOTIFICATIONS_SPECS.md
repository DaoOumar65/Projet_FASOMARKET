# BACKEND - Système de Notifications

## 1. Modèle de données (Entity)

```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titre;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeNotification type;
    
    @Column(nullable = false)
    private Boolean lue = false;
    
    @Column(nullable = false)
    private LocalDateTime dateCreation;
    
    // Relations
    @Column(nullable = false)
    private String utilisateurId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleUtilisateur roleDestinataire;
    
    // Métadonnées optionnelles
    private String actionUrl; // URL vers laquelle rediriger
    private String entityId; // ID de l'entité concernée (commande, produit, etc.)
    private String entityType; // Type d'entité (COMMANDE, PRODUIT, BOUTIQUE, etc.)
    
    // Constructeurs, getters, setters...
}

@Enum
public enum TypeNotification {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
}

@Enum
public enum RoleUtilisateur {
    CLIENT,
    VENDOR,
    ADMIN
}
```

## 2. Service de Notifications

```java
@Service
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    
    // Créer une notification
    public Notification creerNotification(String utilisateurId, RoleUtilisateur role, 
                                        String titre, String message, TypeNotification type) {
        Notification notification = new Notification();
        notification.setUtilisateurId(utilisateurId);
        notification.setRoleDestinataire(role);
        notification.setTitre(titre);
        notification.setMessage(message);
        notification.setType(type);
        notification.setDateCreation(LocalDateTime.now());
        notification.setLue(false);
        
        return notificationRepository.save(notification);
    }
    
    // Récupérer les notifications d'un utilisateur
    public List<Notification> getNotificationsUtilisateur(String utilisateurId, RoleUtilisateur role) {
        return notificationRepository.findByUtilisateurIdAndRoleDestinataireOrderByDateCreationDesc(
            utilisateurId, role);
    }
    
    // Compter les notifications non lues
    public long compterNotificationsNonLues(String utilisateurId, RoleUtilisateur role) {
        return notificationRepository.countByUtilisateurIdAndRoleDestinataireAndLueFalse(
            utilisateurId, role);
    }
    
    // Marquer comme lue
    public void marquerCommeLue(Long notificationId, String utilisateurId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent() && notification.get().getUtilisateurId().equals(utilisateurId)) {
            notification.get().setLue(true);
            notificationRepository.save(notification.get());
        }
    }
    
    // Marquer toutes comme lues
    public void marquerToutesCommeLues(String utilisateurId, RoleUtilisateur role) {
        List<Notification> notifications = notificationRepository
            .findByUtilisateurIdAndRoleDestinataireAndLueFalse(utilisateurId, role);
        
        notifications.forEach(n -> n.setLue(true));
        notificationRepository.saveAll(notifications);
    }
    
    // Notifications système pour événements métier
    public void notifierNouvelleCommande(String vendeurId, String numeroCommande) {
        creerNotification(vendeurId, RoleUtilisateur.VENDOR,
            "Nouvelle commande reçue",
            "Vous avez reçu une nouvelle commande #" + numeroCommande,
            TypeNotification.SUCCESS);
    }
    
    public void notifierCommandeConfirmee(String clientId, String numeroCommande) {
        creerNotification(clientId, RoleUtilisateur.CLIENT,
            "Commande confirmée",
            "Votre commande #" + numeroCommande + " a été confirmée",
            TypeNotification.SUCCESS);
    }
    
    public void notifierStockFaible(String vendeurId, String nomProduit, int stock) {
        creerNotification(vendeurId, RoleUtilisateur.VENDOR,
            "Stock faible",
            "Le stock de \"" + nomProduit + "\" est faible (" + stock + " restants)",
            TypeNotification.WARNING);
    }
    
    public void notifierBoutiqueValidee(String vendeurId, String nomBoutique) {
        creerNotification(vendeurId, RoleUtilisateur.VENDOR,
            "Boutique validée",
            "Votre boutique \"" + nomBoutique + "\" a été validée par l'administration",
            TypeNotification.SUCCESS);
    }
    
    public void notifierBoutiqueRejetee(String vendeurId, String nomBoutique, String raison) {
        creerNotification(vendeurId, RoleUtilisateur.VENDOR,
            "Boutique rejetée",
            "Votre boutique \"" + nomBoutique + "\" a été rejetée. Raison: " + raison,
            TypeNotification.ERROR);
    }
}
```

## 3. Repository

```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUtilisateurIdAndRoleDestinataireOrderByDateCreationDesc(
        String utilisateurId, RoleUtilisateur role);
    
    List<Notification> findByUtilisateurIdAndRoleDestinataireAndLueFalse(
        String utilisateurId, RoleUtilisateur role);
    
    long countByUtilisateurIdAndRoleDestinataireAndLueFalse(
        String utilisateurId, RoleUtilisateur role);
    
    // Nettoyage des anciennes notifications (optionnel)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.dateCreation < :dateLimit")
    void supprimerNotificationsAnciennes(@Param("dateLimit") LocalDateTime dateLimit);
}
```

## 4. Controllers REST

### Client Controller
```java
@RestController
@RequestMapping("/api/client")
@PreAuthorize("hasRole('CLIENT')")
public class ClientNotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication auth) {
        String userId = getUserId(auth);
        List<Notification> notifications = notificationService
            .getNotificationsUtilisateur(userId, RoleUtilisateur.CLIENT);
        
        return ResponseEntity.ok(notifications.stream()
            .map(NotificationResponse::fromEntity)
            .collect(Collectors.toList()));
    }
    
    @GetMapping("/notifications/compteur")
    public ResponseEntity<Long> getCompteurNotifications(Authentication auth) {
        String userId = getUserId(auth);
        long count = notificationService
            .compterNotificationsNonLues(userId, RoleUtilisateur.CLIENT);
        
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/notifications/{id}/lue")
    public ResponseEntity<Void> marquerCommeLue(@PathVariable Long id, Authentication auth) {
        String userId = getUserId(auth);
        notificationService.marquerCommeLue(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/notifications/marquer-toutes-lues")
    public ResponseEntity<Void> marquerToutesCommeLues(Authentication auth) {
        String userId = getUserId(auth);
        notificationService.marquerToutesCommeLues(userId, RoleUtilisateur.CLIENT);
        return ResponseEntity.ok().build();
    }
}
```

### Vendeur Controller
```java
@RestController
@RequestMapping("/api/vendeur")
@PreAuthorize("hasRole('VENDOR')")
public class VendeurNotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication auth) {
        String userId = getUserId(auth);
        List<Notification> notifications = notificationService
            .getNotificationsUtilisateur(userId, RoleUtilisateur.VENDOR);
        
        return ResponseEntity.ok(notifications.stream()
            .map(NotificationResponse::fromEntity)
            .collect(Collectors.toList()));
    }
    
    @GetMapping("/notifications/compteur")
    public ResponseEntity<Long> getCompteurNotifications(Authentication auth) {
        String userId = getUserId(auth);
        long count = notificationService
            .compterNotificationsNonLues(userId, RoleUtilisateur.VENDOR);
        
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/notifications/{id}/lue")
    public ResponseEntity<Void> marquerCommeLue(@PathVariable Long id, Authentication auth) {
        String userId = getUserId(auth);
        notificationService.marquerCommeLue(id, userId);
        return ResponseEntity.ok().build();
    }
}
```

### Admin Controller
```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication auth) {
        String userId = getUserId(auth);
        List<Notification> notifications = notificationService
            .getNotificationsUtilisateur(userId, RoleUtilisateur.ADMIN);
        
        return ResponseEntity.ok(notifications.stream()
            .map(NotificationResponse::fromEntity)
            .collect(Collectors.toList()));
    }
    
    @GetMapping("/notifications/compteur")
    public ResponseEntity<Long> getCompteurNotifications(Authentication auth) {
        String userId = getUserId(auth);
        long count = notificationService
            .compterNotificationsNonLues(userId, RoleUtilisateur.ADMIN);
        
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/notifications/{id}/lue")
    public ResponseEntity<Void> marquerCommeLue(@PathVariable Long id, Authentication auth) {
        String userId = getUserId(auth);
        notificationService.marquerCommeLue(id, userId);
        return ResponseEntity.ok().build();
    }
    
    // Créer une notification pour un utilisateur (admin seulement)
    @PostMapping("/notifications/creer")
    public ResponseEntity<NotificationResponse> creerNotification(
            @RequestBody CreerNotificationRequest request) {
        
        Notification notification = notificationService.creerNotification(
            request.getUtilisateurId(),
            request.getRole(),
            request.getTitre(),
            request.getMessage(),
            request.getType()
        );
        
        return ResponseEntity.ok(NotificationResponse.fromEntity(notification));
    }
}
```

## 5. DTOs

```java
public class NotificationResponse {
    private Long id;
    private String titre;
    private String message;
    private String type;
    private Boolean lue;
    private LocalDateTime dateCreation;
    private String actionUrl;
    
    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitre(notification.getTitre());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setLue(notification.getLue());
        response.setDateCreation(notification.getDateCreation());
        response.setActionUrl(notification.getActionUrl());
        return response;
    }
    
    // getters, setters...
}

public class CreerNotificationRequest {
    private String utilisateurId;
    private RoleUtilisateur role;
    private String titre;
    private String message;
    private TypeNotification type;
    private String actionUrl;
    
    // getters, setters...
}
```

## 6. Migration de base de données

```sql
-- Créer la table des notifications
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') NOT NULL,
    lue BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    utilisateur_id VARCHAR(36) NOT NULL,
    role_destinataire ENUM('CLIENT', 'VENDOR', 'ADMIN') NOT NULL,
    action_url VARCHAR(500),
    entity_id VARCHAR(36),
    entity_type VARCHAR(50)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_notifications_utilisateur_role ON notifications(utilisateur_id, role_destinataire);
CREATE INDEX idx_notifications_non_lues ON notifications(utilisateur_id, role_destinataire, lue);
CREATE INDEX idx_notifications_date ON notifications(date_creation);
```

## 7. Intégration avec les événements métier

### Dans le service de commandes
```java
@Service
public class CommandeService {
    
    private final NotificationService notificationService;
    
    public void creerCommande(CreateCommandeRequest request, String clientId) {
        // ... logique de création de commande
        
        // Notifier le client
        notificationService.notifierCommandeConfirmee(clientId, commande.getNumero());
        
        // Notifier le vendeur
        notificationService.notifierNouvelleCommande(vendeurId, commande.getNumero());
    }
}
```

### Dans le service de produits
```java
@Service
public class ProduitService {
    
    private final NotificationService notificationService;
    
    public void verifierStock(Produit produit) {
        if (produit.getQuantiteStock() <= 5) { // Seuil configurable
            notificationService.notifierStockFaible(
                produit.getBoutique().getVendeurId(),
                produit.getNom(),
                produit.getQuantiteStock()
            );
        }
    }
}
```

## 8. Endpoints API

### Client
- `GET /api/client/notifications` - Liste des notifications
- `GET /api/client/notifications/compteur` - Compteur non lues
- `PUT /api/client/notifications/{id}/lue` - Marquer comme lue
- `PUT /api/client/notifications/marquer-toutes-lues` - Marquer toutes comme lues

### Vendeur
- `GET /api/vendeur/notifications` - Liste des notifications
- `GET /api/vendeur/notifications/compteur` - Compteur non lues
- `PUT /api/vendeur/notifications/{id}/lue` - Marquer comme lue

### Admin
- `GET /api/admin/notifications` - Liste des notifications
- `GET /api/admin/notifications/compteur` - Compteur non lues
- `PUT /api/admin/notifications/{id}/lue` - Marquer comme lue
- `POST /api/admin/notifications/creer` - Créer une notification

## 9. Configuration

```properties
# Configuration des notifications
notifications.cleanup.enabled=true
notifications.cleanup.days=30
notifications.max-per-user=100
```

## 10. Tâche de nettoyage (optionnel)

```java
@Component
public class NotificationCleanupTask {
    
    private final NotificationRepository notificationRepository;
    
    @Scheduled(cron = "0 0 2 * * ?") // Tous les jours à 2h
    public void nettoyerAnciennesNotifications() {
        LocalDateTime dateLimit = LocalDateTime.now().minusDays(30);
        notificationRepository.supprimerNotificationsAnciennes(dateLimit);
    }
}
```

Cette implémentation backend permettra au système de notifications frontend de fonctionner correctement avec de vraies données.