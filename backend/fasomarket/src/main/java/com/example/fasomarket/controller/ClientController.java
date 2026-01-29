package com.example.fasomarket.controller;

import com.example.fasomarket.dto.CartItemDTO;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import com.example.fasomarket.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")
@Tag(name = "Interface Client", description = "API pour le dashboard client")
public class ClientController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private SmsService smsService;

    @Autowired
    private GeocodingService geocodingService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard client", description = "Données du tableau de bord client")
    public ResponseEntity<?> getDashboard(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            Map<String, Object> response = new HashMap<>();

            // Statistiques client
            Map<String, Object> stats = new HashMap<>();

            List<OrderStatus> statusEnCours = Arrays.asList(
                    OrderStatus.PENDING, OrderStatus.CONFIRMED,
                    OrderStatus.PAID, OrderStatus.SHIPPED);

            long commandesEnCours = orderRepository.countByClientIdAndStatusIn(clientId, statusEnCours);
            long commandesTerminees = orderRepository.countByClientIdAndStatus(clientId, OrderStatus.DELIVERED);

            Double montantTotal = orderRepository.sumTotalAmountByClientId(clientId);
            long notificationsNonLues = notificationRepository.countByUserIdAndIsReadFalse(clientId);

            stats.put("commandesEnCours", (int) commandesEnCours);
            stats.put("commandesTerminees", (int) commandesTerminees);
            stats.put("montantTotalDepense", montantTotal != null ? montantTotal.intValue() : 0);
            stats.put("notificationsNonLues", (int) notificationsNonLues);

            response.put("statistiques", stats);

            // Commandes récentes
            List<Order> commandesRecentes = orderRepository.findTop5ByClientIdOrderByCreatedAtDesc(clientId);
            response.put("commandesRecentes", commandesRecentes);

            // Recommandations (produits populaires)
            List<Product> recommandations = productRepository.findTop5ByOrderByCreatedAtDesc();
            response.put("recommandations", recommandations);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du chargement du dashboard: " + e.getMessage());
        }
    }

    @GetMapping("/profil")
    @Operation(summary = "Profil client", description = "Récupère le profil du client")
    public ResponseEntity<?> getProfil(@RequestHeader("X-User-Id") UUID userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            Map<String, Object> profil = new HashMap<>();
            profil.put("id", user.getId());
            profil.put("nomComplet", user.getFullName());
            profil.put("telephone", user.getPhone());
            profil.put("email", user.getEmail());
            profil.put("role", user.getRole().name());
            profil.put("estActif", user.getIsActive());
            profil.put("estVerifie", user.getIsVerified());
            profil.put("dateCreation", user.getCreatedAt());
            
            return ResponseEntity.ok(profil);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/notifications/compteur")
    @Operation(summary = "Compteur notifications", description = "Nombre de notifications non lues")
    public ResponseEntity<?> getCompteurNotifications(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            long count = notificationRepository.countByUserIdAndIsReadFalse(clientId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("hasUnread", count > 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // Favoris
    @GetMapping("/favoris")
    public ResponseEntity<List<Favorite>> getFavoris(@RequestHeader("X-User-Id") UUID userId) {
        List<Favorite> favoris = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(favoris);
    }

    @PostMapping("/favoris/ajouter")
    public ResponseEntity<?> ajouterAuxFavoris(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, String> request) {

        UUID produitId = UUID.fromString(request.get("produitId"));

        // Vérifier si déjà en favoris
        if (favoriteRepository.findByUserIdAndProductId(userId, produitId).isPresent()) {
            return ResponseEntity.badRequest().body("Produit déjà en favoris");
        }

        User user = userRepository.findById(userId).orElse(null);
        Product produit = productRepository.findById(produitId).orElse(null);

        if (user == null || produit == null) {
            return ResponseEntity.badRequest().body("Utilisateur ou produit non trouvé");
        }

        Favorite favori = new Favorite();
        favori.setUser(user);
        favori.setProduct(produit);
        favori.setCreatedAt(LocalDateTime.now());

        favoriteRepository.save(favori);
        return ResponseEntity.ok("Produit ajouté aux favoris");
    }

    @DeleteMapping("/favoris/{produitId}")
    public ResponseEntity<?> supprimerDesFavoris(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID produitId) {

        Favorite favori = favoriteRepository.findByUserIdAndProductId(userId, produitId)
                .orElse(null);

        if (favori == null) {
            return ResponseEntity.notFound().build();
        }

        favoriteRepository.delete(favori);
        return ResponseEntity.ok("Produit retiré des favoris");
    }

    // Adresses
    @GetMapping("/adresses")
    public ResponseEntity<List<Address>> getAdresses(@RequestHeader("X-User-Id") UUID userId) {
        List<Address> adresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        return ResponseEntity.ok(adresses);
    }

    @PostMapping("/adresses/ajouter")
    public ResponseEntity<?> ajouterAdresse(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Address addressData) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Utilisateur non trouvé");
        }

        // Si c'est l'adresse par défaut, désactiver les autres
        if (addressData.getParDefaut() != null && addressData.getParDefaut()) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .forEach(addr -> {
                        addr.setParDefaut(false);
                        addressRepository.save(addr);
                    });
        }

        Address address = new Address();
        address.setUser(user);
        address.setNom(addressData.getNom());
        address.setAdresse(addressData.getAdresse());
        address.setVille(addressData.getVille());
        address.setTelephone(addressData.getTelephone());
        address.setParDefaut(addressData.getParDefaut());

        // Géocoder l'adresse
        try {
            Map<String, Double> coords = geocodingService.geocodeAddress(
                addressData.getAdresse() + ", " + addressData.getVille()
            );
            if (coords != null) {
                address.setLatitude(coords.get("latitude"));
                address.setLongitude(coords.get("longitude"));
                address.setEstVerifiee(true);
            }
        } catch (Exception e) {
            // Continuer sans géolocalisation
        }

        addressRepository.save(address);
        return ResponseEntity.ok("Adresse ajoutée avec succès");
    }

    @PutMapping("/adresses/{id}")
    public ResponseEntity<?> updateAdresse(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @RequestBody Address addressData) {

        Address address = addressRepository.findByIdAndUserId(id, userId).orElse(null);
        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        // Si c'est l'adresse par défaut, désactiver les autres
        if (addressData.getParDefaut() != null && addressData.getParDefaut() && 
            (address.getParDefaut() == null || !address.getParDefaut())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .forEach(addr -> {
                        addr.setParDefaut(false);
                        addressRepository.save(addr);
                    });
        }

        address.setNom(addressData.getNom());
        address.setAdresse(addressData.getAdresse());
        address.setTelephone(addressData.getTelephone());
        address.setParDefaut(addressData.getParDefaut());

        addressRepository.save(address);
        return ResponseEntity.ok("Adresse modifiée avec succès");
    }

    @DeleteMapping("/adresses/{id}")
    public ResponseEntity<?> supprimerAdresse(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {

        Address address = addressRepository.findByIdAndUserId(id, userId).orElse(null);
        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        if (address.getParDefaut() != null && address.getParDefaut()) {
            return ResponseEntity.badRequest().body("Impossible de supprimer l'adresse par défaut");
        }

        addressRepository.delete(address);
        return ResponseEntity.ok("Adresse supprimée");
    }

    @PutMapping("/adresses/{id}/defaut")
    public ResponseEntity<?> definirAdresseParDefaut(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {

        Address address = addressRepository.findByIdAndUserId(id, userId).orElse(null);
        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        // Désactiver toutes les autres adresses par défaut
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .forEach(addr -> {
                    addr.setParDefaut(false);
                    addressRepository.save(addr);
                });

        address.setParDefaut(true);
        addressRepository.save(address);

        return ResponseEntity.ok("Adresse définie par défaut");
    }

    // Panier
    @GetMapping("/panier")
    @Operation(summary = "Voir le panier", description = "Récupère le contenu du panier du client")
    public ResponseEntity<?> getPanier(@RequestHeader(value = "X-User-Id", required = false) String userIdStr) {
        try {
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "En-tête X-User-Id requis");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            UUID clientId;
            try {
                clientId = UUID.fromString(userIdStr);
            } catch (IllegalArgumentException e) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "ID utilisateur invalide");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            User client = userRepository.findById(clientId).orElse(null);
            if (client == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Client non trouvé");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            List<Cart> items = cartRepository.findByClient(client);
            List<CartItemDTO> dtos = items.stream()
                .map(this::convertCartToDTO)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", dtos);
            response.put("total", dtos.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/paiement/simuler")
    @Operation(summary = "Simuler paiement", description = "Simule un paiement pour une commande")
    public ResponseEntity<?> simulerPaiement(
            @RequestHeader("X-User-Id") UUID clientId,
            @RequestBody Map<String, Object> request) {
        try {
            String commandeId = (String) request.get("commandeId");
            String modePaiement = (String) request.get("modePaiement");
            String numeroTelephone = (String) request.get("numeroTelephone");
            
            // Simuler délai de traitement
            Thread.sleep(2000);
            
            // Simuler succès/échec (90% de succès)
            boolean succes = Math.random() > 0.1;
            
            Map<String, Object> response = new HashMap<>();
            
            if (succes) {
                response.put("statut", "SUCCES");
                response.put("message", "Paiement effectué avec succès");
                response.put("transactionId", "TXN-" + System.currentTimeMillis());
                response.put("modePaiement", modePaiement);
                response.put("numeroTelephone", numeroTelephone);
                response.put("montant", request.get("montant"));
                response.put("dateTransaction", LocalDateTime.now());
            } else {
                response.put("statut", "ECHEC");
                response.put("message", "Paiement échoué. Veuillez réessayer.");
                response.put("codeErreur", "ERR_" + (int)(Math.random() * 1000));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
    
    @GetMapping("/paiement/modes")
    @Operation(summary = "Modes de paiement", description = "Liste des modes de paiement disponibles")
    public ResponseEntity<?> getModePaiement() {
        List<Map<String, Object>> modes = new ArrayList<>();
        
        // Orange Money
        Map<String, Object> orange = new HashMap<>();
        orange.put("id", "ORANGE_MONEY");
        orange.put("nom", "Orange Money");
        orange.put("logo", "orange-money.png");
        orange.put("description", "Paiement via Orange Money");
        orange.put("frais", 0);
        orange.put("actif", true);
        modes.add(orange);
        
        // Moov Money
        Map<String, Object> moov = new HashMap<>();
        moov.put("id", "MOOV_MONEY");
        moov.put("nom", "Moov Money");
        moov.put("logo", "moov-money.png");
        moov.put("description", "Paiement via Moov Money");
        moov.put("frais", 0);
        moov.put("actif", true);
        modes.add(moov);
        
        // Coris Money
        Map<String, Object> coris = new HashMap<>();
        coris.put("id", "CORIS_MONEY");
        coris.put("nom", "Coris Money");
        coris.put("logo", "coris-money.png");
        coris.put("description", "Paiement via Coris Money");
        coris.put("frais", 0);
        coris.put("actif", true);
        modes.add(coris);
        
        // Paiement à la livraison
        Map<String, Object> livraison = new HashMap<>();
        livraison.put("id", "CASH_ON_DELIVERY");
        livraison.put("nom", "Paiement à la livraison");
        livraison.put("logo", "cash-delivery.png");
        livraison.put("description", "Payer en espèces à la réception");
        livraison.put("frais", 0);
        livraison.put("actif", true);
        modes.add(livraison);
        
        return ResponseEntity.ok(modes);
    }

    @PostMapping("/panier/ajouter")
    @Operation(summary = "Ajouter au panier", description = "Ajoute un produit au panier")
    public ResponseEntity<?> ajouterAuPanier(
            @RequestHeader("X-User-Id") UUID clientId,
            @RequestBody Map<String, Object> request) {
        try {
            UUID produitId = UUID.fromString((String) request.get("produitId"));
            Integer quantite = (Integer) request.get("quantite");
            Long varianteId = request.get("varianteId") != null ? Long.valueOf(request.get("varianteId").toString()) : null;

            User client = userRepository.findById(clientId).orElse(null);
            Product produit = productRepository.findById(produitId).orElse(null);

            if (client == null || produit == null) {
                return ResponseEntity.badRequest().body("Client ou produit non trouvé");
            }

            // Vérifier si le produit est déjà dans le panier avec la même variante
            Optional<Cart> existant = cartRepository.findByClientAndProduct(client, produit)
                .filter(cart -> {
                    if (varianteId == null) {
                        return cart.getVariante() == null;
                    } else {
                        return cart.getVariante() != null && cart.getVariante().getId().equals(varianteId);
                    }
                });
                
            if (existant.isPresent()) {
                Cart item = existant.get();
                item.setQuantity(item.getQuantity() + quantite);
                cartRepository.save(item);
            } else {
                Cart item = new Cart(client, produit, quantite);
                
                // Ajouter la variante si spécifiée
                if (varianteId != null) {
                    // Note: Vous devrez ajouter ProduitVarianteRepository ici
                    // item.setVariante(produitVarianteRepository.findById(varianteId).orElse(null));
                }
                
                cartRepository.save(item);
            }

            return ResponseEntity.ok("Produit ajouté au panier");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/panier/{itemId}")
    @Operation(summary = "Supprimer du panier", description = "Supprime un article du panier")
    public ResponseEntity<?> supprimerDuPanier(
            @RequestHeader("X-User-Id") UUID clientId,
            @PathVariable String itemId) {
        try {
            UUID cartId;
            try {
                cartId = UUID.fromString(itemId);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("ID invalide: " + itemId);
            }
            
            Cart item = cartRepository.findById(cartId).orElse(null);
            if (item == null || !item.getClient().getId().equals(clientId)) {
                return ResponseEntity.notFound().build();
            }

            cartRepository.delete(item);
            return ResponseEntity.ok("Article supprimé du panier");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/panier/vider")
    @Operation(summary = "Vider le panier", description = "Vide tout le panier du client")
    public ResponseEntity<?> viderPanier(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            User client = userRepository.findById(clientId).orElse(null);
            if (client == null) {
                return ResponseEntity.badRequest().body("Client non trouvé");
            }

            cartRepository.deleteByClient(client);
            return ResponseEntity.ok("Panier vidé");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    private CartItemDTO convertCartToDTO(Cart cart) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cart.getId());
        dto.setProductId(cart.getProduct().getId());
        dto.setProductName(cart.getProduct().getName());
        dto.setProductPrice(cart.getProduct().getPrice());
        dto.setQuantity(cart.getQuantity());
        dto.setSubtotal(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
        dto.setCreatedAt(cart.getCreatedAt());
        
        if (cart.getProduct().getImages() != null && !cart.getProduct().getImages().isEmpty()) {
            String[] images = cart.getProduct().getImages().split(",");
            List<String> imageUrls = new ArrayList<>();
            for (String image : images) {
                String imageUrl = image.trim();
                if (!imageUrl.startsWith("http")) {
                    imageUrl = "http://localhost:8081/uploads/produits/" + imageUrl;
                }
                imageUrls.add(imageUrl);
            }
            dto.setProductImages(imageUrls);
        }
        
        return dto;
    }

    // Commandes
    @PostMapping("/commandes/creer")
    @Operation(summary = "Créer commande", description = "Crée une commande à partir du panier")
    public ResponseEntity<?> creerCommande(
            @RequestHeader("X-User-Id") UUID clientId,
            @RequestBody Map<String, Object> request) {
        try {
            User client = userRepository.findById(clientId).orElse(null);
            if (client == null) {
                return ResponseEntity.badRequest().body("Client non trouvé");
            }

            List<Cart> items = cartRepository.findByClient(client);
            if (items.isEmpty()) {
                return ResponseEntity.badRequest().body("Panier vide");
            }

            // Créer la commande avec calcul correct du total
            Order order = new Order();
            order.setClient(client);
            order.setStatus(OrderStatus.PENDING);
            order.setDeliveryAddress((String) request.get("adresseLivraison"));
            order.setNeedsDelivery((Boolean) request.getOrDefault("needsDelivery", false));
            order.setDeliveryPhone((String) request.get("numeroTelephone"));
            
            // Calculer le total AVANT de sauvegarder
            BigDecimal total = BigDecimal.ZERO;
            
            for (Cart item : items) {
                // Vérifier le stock
                if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                    return ResponseEntity.badRequest().body(
                        "Stock insuffisant pour " + item.getProduct().getName());
                }
                
                BigDecimal itemTotal = item.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
            }
            
            // Définir le total AVANT de sauvegarder
            order.setTotalAmount(total);
            
            // Sauvegarder d'abord la commande
            Order savedOrder = orderRepository.save(order);
            
            // Puis créer les OrderItems
            for (Cart item : items) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(item.getProduct());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setUnitPrice(item.getProduct().getPrice());
                orderItem.setSelectedColor(item.getSelectedColor());
                orderItem.setSelectedSize(item.getSelectedSize());
                orderItem.setSelectedModel(item.getSelectedModel());
                orderItem.setCustomOptions(item.getCustomOptions());
                
                savedOrder.getOrderItems().add(orderItem);
            }
            
            // Sauvegarder à nouveau avec les items
            savedOrder = orderRepository.save(savedOrder);
            
            // Vider le panier
            cartRepository.deleteByClient(client);
            
            // SMS de confirmation
            String numeroTelephone = (String) request.get("numeroTelephone");
            if (numeroTelephone != null && !numeroTelephone.isEmpty()) {
                String numeroCommande = "CMD-" + savedOrder.getId().toString().substring(0, 8);
                try {
                    smsService.envoyerSmsConfirmationCommande(numeroTelephone, numeroCommande, total.doubleValue());
                } catch (Exception e) {
                    // Continuer même si SMS échoue
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedOrder.getId());
            response.put("numeroCommande", "CMD-" + savedOrder.getId().toString().substring(0, 8));
            response.put("statut", savedOrder.getStatus().name());
            response.put("total", savedOrder.getTotalAmount());
            response.put("message", "Commande créée avec succès - Total: " + total + " FCFA");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/commandes")
    @Operation(summary = "Mes commandes", description = "Liste toutes les commandes du client")
    public ResponseEntity<?> getCommandes(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            List<Order> commandes = orderRepository.findByClientIdWithDetailsOrderByCreatedAtDesc(clientId);
            
            List<Map<String, Object>> response = new ArrayList<>();
            for (Order commande : commandes) {
                Map<String, Object> commandeData = new HashMap<>();
                commandeData.put("id", commande.getId());
                commandeData.put("numeroCommande", "CMD-" + commande.getId().toString().substring(0, 8));
                commandeData.put("dateCommande", commande.getCreatedAt());
                commandeData.put("statut", getStatusLabel(commande.getStatus()));
                commandeData.put("statutCode", commande.getStatus().name());
                commandeData.put("totalAmount", commande.getTotalAmount());
                
                // Compter les articles
                int nombreArticles = 0;
                if (commande.getOrderItems() != null) {
                    for (OrderItem item : commande.getOrderItems()) {
                        nombreArticles += item.getQuantity();
                    }
                }
                commandeData.put("nombreArticles", nombreArticles);
                
                // Ajouter si la commande peut être annulée
                commandeData.put("peutAnnuler", canCancelOrder(commande.getStatus()));
                
                response.add(commandeData);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/historique-commandes")
    @Operation(summary = "Historique commandes", description = "Alias pour /commandes")
    public ResponseEntity<?> getHistoriqueCommandes(@RequestHeader("X-User-Id") UUID clientId) {
        return getCommandes(clientId);
    }

    @GetMapping("/commandes/{id}")
    @Operation(summary = "Détails commande", description = "Détails d'une commande spécifique")
    public ResponseEntity<?> getCommande(
            @RequestHeader("X-User-Id") UUID clientId,
            @PathVariable String id) {
        try {
            UUID orderId;
            try {
                orderId = UUID.fromString(id);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("ID de commande invalide: " + id);
            }
            
            Order commande = orderRepository.findByIdWithDetails(orderId).orElse(null);
            if (commande == null || !commande.getClient().getId().equals(clientId)) {
                return ResponseEntity.notFound().build();
            }
            
            // Créer une réponse détaillée
            Map<String, Object> response = new HashMap<>();
            response.put("id", commande.getId());
            response.put("numeroCommande", "CMD-" + commande.getId().toString().substring(0, 8));
            response.put("statut", getStatusLabel(commande.getStatus()));
            response.put("statutCode", commande.getStatus().name());
            response.put("dateCommande", commande.getCreatedAt());
            response.put("totalAmount", commande.getTotalAmount());
            response.put("adresseLivraison", commande.getDeliveryAddress());
            response.put("telephoneLivraison", commande.getDeliveryPhone());
            response.put("modePaiement", "Non spécifié");
            response.put("needsDelivery", commande.getNeedsDelivery());
            response.put("peutAnnuler", canCancelOrder(commande.getStatus()));
            
            // Articles de la commande
            List<Map<String, Object>> articles = new ArrayList<>();
            if (commande.getOrderItems() != null) {
                for (OrderItem item : commande.getOrderItems()) {
                    Map<String, Object> article = new HashMap<>();
                    article.put("id", item.getId());
                    article.put("produitNom", item.getProduct().getName());
                    article.put("quantite", item.getQuantity());
                    article.put("prixUnitaire", item.getUnitPrice());
                    article.put("sousTotal", item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    article.put("images", item.getProduct().getImages());
                    articles.add(article);
                }
            }
            response.put("articles", articles);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
    
    private String getStatusLabel(OrderStatus status) {
        switch (status) {
            case PENDING: return "En attente";
            case CONFIRMED: return "Confirmée";
            case SHIPPED: return "Expédiée";
            case DELIVERED: return "Livrée";
            case CANCELLED: return "Annulée";
            case PAID: return "Payée";
            default: return status.name();
        }
    }
    
    private boolean canCancelOrder(OrderStatus status) {
        // Le client peut annuler seulement si la commande n'est pas encore expédiée
        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED;
    }
    
    @PutMapping("/commandes/{id}/annuler")
    @Operation(summary = "Annuler commande", description = "Annule une commande si possible")
    public ResponseEntity<?> annulerCommande(
            @RequestHeader("X-User-Id") UUID clientId,
            @PathVariable String id) {
        try {
            UUID orderId = UUID.fromString(id);
            Order commande = orderRepository.findByIdWithDetails(orderId).orElse(null);
            
            if (commande == null || !commande.getClient().getId().equals(clientId)) {
                return ResponseEntity.notFound().build();
            }
            
            if (!canCancelOrder(commande.getStatus())) {
                return ResponseEntity.badRequest().body("Cette commande ne peut plus être annulée");
            }
            
            commande.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(commande);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Commande annulée avec succès");
            response.put("statut", "Annulée");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}
