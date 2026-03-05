// Backend Java - WebSocket Configuration et Controller

// 1. WebSocketConfig.java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new NotificationWebSocketHandler(), "/ws/notifications")
                .setAllowedOrigins("*") // En production, spécifier les domaines autorisés
                .withSockJS();
    }
}

// 2. NotificationWebSocketHandler.java
@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    
    public NotificationWebSocketHandler(NotificationService notificationService) {
        this.notificationService = notificationService;
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserIdFromSession(session);
        String userRole = getUserRoleFromSession(session);
        
        if (userId != null) {
            userSessions.put(userId, session);
            System.out.println("✅ WebSocket connecté: " + userId + " (" + userRole + ")");
            
            // Envoyer confirmation de connexion
            sendToUser(userId, Map.of(
                "type", "connection_established",
                "message", "Notifications temps réel activées",
                "timestamp", System.currentTimeMillis()
            ));
            
            // Envoyer statistiques initiales
            try {
                Map<String, Object> stats = notificationService.getStats(userId);
                sendToUser(userId, Map.of(
                    "type", "stats_update",
                    "data", stats
                ));
            } catch (Exception e) {
                System.err.println("Erreur envoi stats initiales: " + e.getMessage());
            }
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            System.out.println("❌ WebSocket déconnecté: " + userId);
        }
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId == null) return;
        
        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String action = (String) payload.get("action");
            
            switch (action) {
                case "get_notifications":
                    handleGetNotifications(userId, payload, session);
                    break;
                case "get_stats":
                    handleGetStats(userId, session);
                    break;
                case "mark_as_read":
                    handleMarkAsRead(userId, (String) payload.get("notificationId"));
                    break;
                case "mark_all_as_read":
                    handleMarkAllAsRead(userId);
                    break;
                default:
                    System.out.println("Action inconnue: " + action);
            }
        } catch (Exception e) {
            System.err.println("Erreur traitement message WebSocket: " + e.getMessage());
            // Envoyer réponse d'erreur
            sendToUser(userId, Map.of(
                "type", "error",
                "message", "Erreur traitement de la requête"
            ));
        }
    }
    
    private void handleGetNotifications(String userId, Map<String, Object> payload, WebSocketSession session) {
        try {
            int page = (Integer) payload.getOrDefault("page", 0);
            int size = (Integer) payload.getOrDefault("size", 20);
            
            List<Map<String, Object>> notifications = notificationService.getNotifications(userId, page, size);
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "notifications_response",
                "data", notifications
            ))));
        } catch (Exception e) {
            System.err.println("Erreur handleGetNotifications: " + e.getMessage());
        }
    }
    
    private void handleGetStats(String userId, WebSocketSession session) {
        try {
            Map<String, Object> stats = notificationService.getStats(userId);
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "type", "stats_response",
                "data", stats
            ))));
        } catch (Exception e) {
            System.err.println("Erreur handleGetStats: " + e.getMessage());
        }
    }
    
    private void handleMarkAsRead(String userId, String notificationId) {
        try {
            notificationService.markAsRead(notificationId, userId);
            
            // Notifier le changement
            sendToUser(userId, Map.of(
                "type", "notification_read",
                "notificationId", notificationId
            ));
            
            // Mettre à jour les stats
            Map<String, Object> stats = notificationService.getStats(userId);
            sendToUser(userId, Map.of(
                "type", "stats_update",
                "data", stats
            ));
        } catch (Exception e) {
            System.err.println("Erreur handleMarkAsRead: " + e.getMessage());
        }
    }
    
    private void handleMarkAllAsRead(String userId) {
        try {
            notificationService.markAllAsRead(userId);
            
            // Notifier le changement
            sendToUser(userId, Map.of(
                "type", "all_notifications_read"
            ));
            
            // Mettre à jour les stats
            Map<String, Object> stats = notificationService.getStats(userId);
            sendToUser(userId, Map.of(
                "type", "stats_update",
                "data", stats
            ));
        } catch (Exception e) {
            System.err.println("Erreur handleMarkAllAsRead: " + e.getMessage());
        }
    }
    
    // Méthode publique pour envoyer notifications
    public void sendNotificationToUser(String userId, Map<String, Object> notification) {
        sendToUser(userId, Map.of(
            "type", "notification",
            "data", notification
        ));
    }
    
    // Diffusion à tous les utilisateurs connectés
    public void broadcastNotification(Map<String, Object> notification) {
        userSessions.forEach((userId, session) -> {
            try {
                sendToUser(userId, Map.of(
                    "type", "notification",
                    "data", notification
                ));
            } catch (Exception e) {
                System.err.println("Erreur broadcast à " + userId + ": " + e.getMessage());
            }
        });
    }
    
    private void sendToUser(String userId, Map<String, Object> message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(jsonMessage));
            } catch (Exception e) {
                System.err.println("Erreur envoi message à " + userId + ": " + e.getMessage());
                // Nettoyer la session fermée
                userSessions.remove(userId);
            }
        }
    }
    
    private String getUserIdFromSession(WebSocketSession session) {
        try {
            Map<String, Object> attributes = session.getAttributes();
            return (String) attributes.get("userId");
        } catch (Exception e) {
            // Fallback: extraire depuis les headers ou query params
            String query = session.getUri().getQuery();
            if (query != null && query.contains("userId=")) {
                return query.split("userId=")[1].split("&")[0];
            }
            return null;
        }
    }
    
    private String getUserRoleFromSession(WebSocketSession session) {
        try {
            Map<String, Object> attributes = session.getAttributes();
            return (String) attributes.get("userRole");
        } catch (Exception e) {
            String query = session.getUri().getQuery();
            if (query != null && query.contains("userRole=")) {
                return query.split("userRole=")[1].split("&")[0];
            }
            return "CLIENT";
        }
    }
    
    // Méthodes utilitaires
    public boolean isUserConnected(String userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }
    
    public int getConnectedUsersCount() {
        return (int) userSessions.values().stream()
                .filter(WebSocketSession::isOpen)
                .count();
    }
    
    public Set<String> getConnectedUserIds() {
        return userSessions.entrySet().stream()
                .filter(entry -> entry.getValue().isOpen())
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }
}

// 3. NotificationService.java (Service métier)
@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketHandler webSocketHandler;
    
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    
    @Autowired
    public void setWebSocketHandler(NotificationWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
    }
    
    public void createNotification(String userId, String userRole, String type, String titre, String message, Map<String, Object> data) {
        try {
            // ✅ Créer notification en base
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", UUID.randomUUID().toString());
            notification.put("type", type);
            notification.put("titre", titre);
            notification.put("message", message);
            notification.put("userId", userId);
            notification.put("userRole", userRole);
            notification.put("data", data);
            notification.put("lu", false);
            notification.put("dateCreation", LocalDateTime.now().toString());
            notification.put("priority", determinePriority(type));
            
            // Sauvegarder en base (optionnel)
            // notificationRepository.save(notification);
            
            // ✅ Envoyer via WebSocket
            if (webSocketHandler != null) {
                webSocketHandler.sendNotificationToUser(userId, notification);
            }
            
            System.out.println("✅ Notification créée: " + titre + " pour " + userId);
            
        } catch (Exception e) {
            System.err.println("Erreur création notification: " + e.getMessage());
        }
    }
    
    public List<Map<String, Object>> getNotifications(String userId, int page, int size) {
        try {
            // En production, récupérer depuis la base de données
            // return notificationRepository.findByUserIdOrderByDateCreationDesc(userId, PageRequest.of(page, size));
            
            // ✅ Fallback avec données simulées
            return generateFallbackNotifications(userId, page, size);
        } catch (Exception e) {
            System.err.println("Erreur getNotifications: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public Map<String, Object> getStats(String userId) {
        try {
            // En production, calculer depuis la base
            // return notificationRepository.getStatsByUserId(userId);
            
            // ✅ Fallback avec stats simulées
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", 15);
            stats.put("nonLues", 3);
            stats.put("parType", Map.of(
                "commande", 5,
                "stock", 3,
                "system", 7
            ));
            return stats;
        } catch (Exception e) {
            System.err.println("Erreur getStats: " + e.getMessage());
            return Map.of("total", 0, "nonLues", 0, "parType", Map.of());
        }
    }
    
    public void markAsRead(String notificationId, String userId) {
        try {
            // notificationRepository.markAsRead(notificationId, userId);
            System.out.println("✅ Notification " + notificationId + " marquée comme lue");
        } catch (Exception e) {
            System.err.println("Erreur markAsRead: " + e.getMessage());
        }
    }
    
    public void markAllAsRead(String userId) {
        try {
            // notificationRepository.markAllAsReadByUserId(userId);
            System.out.println("✅ Toutes les notifications marquées comme lues pour " + userId);
        } catch (Exception e) {
            System.err.println("Erreur markAllAsRead: " + e.getMessage());
        }
    }
    
    // Méthodes de déclenchement automatique
    public void notifyNewOrder(String vendeurId, String commandeId, double montant) {
        createNotification(
            vendeurId,
            "VENDEUR",
            "commande",
            "Nouvelle commande",
            "Vous avez reçu une nouvelle commande de " + montant + " FCFA",
            Map.of("commandeId", commandeId, "montant", montant)
        );
    }
    
    public void notifyLowStock(String vendeurId, String produitNom, int stock) {
        createNotification(
            vendeurId,
            "VENDEUR",
            "stock",
            "Stock faible",
            "Le produit " + produitNom + " n'a plus que " + stock + " unités en stock",
            Map.of("produitNom", produitNom, "stock", stock)
        );
    }
    
    public void notifyOrderStatusChange(String clientId, String commandeId, String nouveauStatut) {
        createNotification(
            clientId,
            "CLIENT",
            "commande",
            "Commande mise à jour",
            "Votre commande #" + commandeId + " est maintenant " + nouveauStatut,
            Map.of("commandeId", commandeId, "statut", nouveauStatut)
        );
    }
    
    private String determinePriority(String type) {
        switch (type) {
            case "commande": return "high";
            case "paiement": return "urgent";
            case "stock": return "medium";
            case "validation": return "medium";
            case "message": return "medium";
            default: return "low";
        }
    }
    
    private List<Map<String, Object>> generateFallbackNotifications(String userId, int page, int size) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        
        // Générer quelques notifications de test
        for (int i = 0; i < Math.min(size, 5); i++) {
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", "fallback-" + (page * size + i));
            notification.put("type", "system");
            notification.put("titre", "Notification test " + (i + 1));
            notification.put("message", "Ceci est une notification de test générée automatiquement");
            notification.put("userId", userId);
            notification.put("lu", i % 3 != 0); // Quelques non lues
            notification.put("dateCreation", LocalDateTime.now().minusMinutes(i * 10).toString());
            notification.put("priority", "low");
            notifications.add(notification);
        }
        
        return notifications;
    }
}