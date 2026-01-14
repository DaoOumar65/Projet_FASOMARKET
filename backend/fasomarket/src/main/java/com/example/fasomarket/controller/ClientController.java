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
    public ResponseEntity<?> getPanier(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            User client = userRepository.findById(clientId).orElse(null);
            if (client == null) {
                return ResponseEntity.badRequest().body("Client non trouvé");
            }

            List<Cart> items = cartRepository.findByClient(client);
            List<CartItemDTO> dtos = items.stream()
                .map(this::convertCartToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/panier/ajouter")
    @Operation(summary = "Ajouter au panier", description = "Ajoute un produit au panier")
    public ResponseEntity<?> ajouterAuPanier(
            @RequestHeader("X-User-Id") UUID clientId,
            @RequestBody Map<String, Object> request) {
        try {
            UUID produitId = UUID.fromString((String) request.get("produitId"));
            Integer quantite = (Integer) request.get("quantite");

            User client = userRepository.findById(clientId).orElse(null);
            Product produit = productRepository.findById(produitId).orElse(null);

            if (client == null || produit == null) {
                return ResponseEntity.badRequest().body("Client ou produit non trouvé");
            }

            // Vérifier si le produit est déjà dans le panier
            Optional<Cart> existant = cartRepository.findByClientAndProduct(client, produit);
            if (existant.isPresent()) {
                Cart item = existant.get();
                item.setQuantity(item.getQuantity() + quantite);
                cartRepository.save(item);
            } else {
                Cart item = new Cart(client, produit, quantite);
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
            dto.setProductImage(images[0].trim());
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

            // Créer la commande
            Order order = new Order();
            order.setClient(client);
            order.setStatus(OrderStatus.PENDING);
            order.setDeliveryAddress((String) request.get("adresseLivraison"));
            order.setNeedsDelivery((Boolean) request.getOrDefault("needsDelivery", false));
            order.setDeliveryPhone((String) request.get("numeroTelephone"));
            
            // Calculer le total et créer les OrderItems
            BigDecimal total = BigDecimal.ZERO;
            for (Cart item : items) {
                BigDecimal itemTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
                
                OrderItem orderItem = new OrderItem(order, item.getProduct(), item.getQuantity(), item.getProduct().getPrice());
                order.getOrderItems().add(orderItem);
            }
            order.setTotalAmount(total);
            
            orderRepository.save(order);
            
            // Vider le panier
            cartRepository.deleteByClient(client);
            
            // Envoyer SMS de confirmation
            String numeroTelephone = (String) request.get("numeroTelephone");
            if (numeroTelephone != null && !numeroTelephone.isEmpty()) {
                String numeroCommande = "CMD" + order.getId();
                smsService.envoyerSmsConfirmationCommande(numeroTelephone, numeroCommande, total.doubleValue());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", order.getId());
            response.put("numeroCommande", "CMD" + order.getId());
            response.put("statut", order.getStatus().name());
            response.put("total", order.getTotalAmount());
            response.put("message", "Commande créée avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/commandes")
    @Operation(summary = "Mes commandes", description = "Liste toutes les commandes du client")
    public ResponseEntity<?> getCommandes(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            List<Order> commandes = orderRepository.findByClientIdOrderByCreatedAtDesc(clientId);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
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
            
            Order commande = orderRepository.findById(orderId).orElse(null);
            if (commande == null || !commande.getClient().getId().equals(clientId)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}
