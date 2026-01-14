package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.dto.CommandeItemResponse;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public CommandeResponse creerCommande(UUID clientId, CreerCommandeRequest request) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        if (!client.getRole().equals(Role.CLIENT)) {
            throw new RuntimeException("Seuls les clients peuvent passer commande");
        }

        List<Cart> cartItems = cartRepository.findByClient(client);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Le panier est vide");
        }

        // Vérifier la disponibilité des produits
        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (!product.getIsActive() || !product.getAvailable()) {
                throw new RuntimeException("Le produit " + product.getName() + " n'est plus disponible");
            }
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock insuffisant pour " + product.getName());
            }
        }

        // Créer la commande
        Order order = new Order(client, request.getAdresseLivraison());
        order = orderRepository.save(order);
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Créer les articles de commande et décrémenter le stock
        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), product.getPrice());
            orderItemRepository.save(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());

            // Décrémenter le stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Mettre à jour le montant total
        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        // Vider le panier
        cartRepository.deleteByClient(client);

        // Notifications
        final Order finalOrder = order;
        final BigDecimal finalAmount = totalAmount;

        notificationService.creerNotification(
                client.getId(),
                "Commande créée",
                "Votre commande #" + finalOrder.getId().toString().substring(0, 8) + " a été créée. Montant: "
                        + finalAmount + " FCFA");

        cartItems.stream()
                .map(cart -> cart.getProduct().getShop().getVendor().getUser())
                .distinct()
                .forEach(vendeur -> {
                    notificationService.creerNotification(
                            vendeur.getId(),
                            "Nouvelle commande reçue",
                            "Vous avez reçu une nouvelle commande de " + client.getFullName() + ". Montant: "
                                    + finalAmount + " FCFA");
                });

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        admins.forEach(admin -> {
            notificationService.creerNotification(
                    admin.getId(),
                    "Nouvelle commande sur la plateforme",
                    "Commande #" + finalOrder.getId().toString().substring(0, 8) + " créée par " + client.getFullName()
                            + ". Montant: " + finalAmount + " FCFA");
        });

        return mapOrderToResponse(order);
    }

    public List<CommandeResponse> obtenirMesCommandes(UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        return orderRepository.findByClientOrderByCreatedAtDesc(client)
                .stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    public CommandeResponse obtenirCommande(UUID clientId, UUID commandeId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!order.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Non autorisé à voir cette commande");
        }

        return mapOrderToResponse(order);
    }

    public List<CommandeResponse> obtenirCommandesVendeur(UUID vendorUserId) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Vendeur non trouvé"));

        if (!vendor.getRole().equals(Role.VENDOR)) {
            throw new RuntimeException("Seuls les vendeurs peuvent voir leurs commandes");
        }

        return orderRepository.findOrdersByVendor(vendor)
                .stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    public List<CommandeResponse> obtenirCommandesVendeurParStatut(UUID vendorUserId, OrderStatus statut) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Vendeur non trouvé"));

        if (!vendor.getRole().equals(Role.VENDOR)) {
            throw new RuntimeException("Seuls les vendeurs peuvent voir leurs commandes");
        }

        return orderRepository.findOrdersByVendorAndStatus(vendor, statut)
                .stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommandeResponse changerStatutCommandeVendeur(UUID vendorUserId, UUID commandeId,
            OrderStatus nouveauStatut) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Vendeur non trouvé"));

        if (!vendor.getRole().equals(Role.VENDOR)) {
            throw new RuntimeException("Seuls les vendeurs peuvent modifier le statut");
        }

        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        boolean hasProductsInOrder = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getShop().getVendor().getUser().getId().equals(vendorUserId));

        if (!hasProductsInOrder) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette commande");
        }

        if (!isValidStatusTransition(order.getStatus(), nouveauStatut)) {
            throw new RuntimeException("Transition de statut non autorisée");
        }

        order.setStatus(nouveauStatut);
        order = orderRepository.save(order);

        String statusMessage = getStatusMessage(nouveauStatut);
        final Order finalOrder = order;

        notificationService.creerNotification(
                finalOrder.getClient().getId(),
                "Mise à jour commande",
                statusMessage + " - Commande #" + finalOrder.getId().toString().substring(0, 8));

        if (nouveauStatut == OrderStatus.DELIVERED || nouveauStatut == OrderStatus.CANCELLED) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            admins.forEach(admin -> {
                notificationService.creerNotification(
                        admin.getId(),
                        "Commande " + (nouveauStatut == OrderStatus.DELIVERED ? "livrée" : "annulée"),
                        "Commande #" + finalOrder.getId().toString().substring(0, 8) + " "
                                + statusMessage.toLowerCase());
            });
        }

        return mapOrderToResponse(order);
    }

    private String getStatusMessage(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Votre commande a été confirmée par le vendeur";
            case SHIPPED -> "Votre commande a été expédiée";
            case DELIVERED -> "Votre commande a été livrée";
            case CANCELLED -> "Votre commande a été annulée";
            default -> "Statut de votre commande mis à jour";
        };
    }

    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.PAID || newStatus == OrderStatus.CANCELLED;
            case PAID -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.CANCELLED;
            case SHIPPED -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    @Transactional
    public CommandeResponse changerStatutCommande(UUID commandeId, OrderStatus nouveauStatut) {
        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        order.setStatus(nouveauStatut);
        order = orderRepository.save(order);

        return mapOrderToResponse(order);
    }

    @Transactional
    public void annulerCommande(UUID clientId, UUID commandeId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!order.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Non autorisé à annuler cette commande");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Cette commande ne peut plus être annulée");
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        final Order finalOrder = order;

        notificationService.creerNotification(
                clientId,
                "Commande annulée",
                "Votre commande #" + finalOrder.getId().toString().substring(0, 8) + " a été annulée avec succès");

        finalOrder.getOrderItems().stream()
                .map(item -> item.getProduct().getShop().getVendor().getUser())
                .distinct()
                .forEach(vendeur -> {
                    notificationService.creerNotification(
                            vendeur.getId(),
                            "Commande annulée",
                            "La commande #" + finalOrder.getId().toString().substring(0, 8)
                                    + " a été annulée par le client");
                });
    }

    private CommandeResponse mapOrderToResponse(Order order) {
        CommandeResponse response = new CommandeResponse();
        response.setId(order.getId());
        response.setClientId(order.getClient().getId());
        response.setNomClient(order.getClient().getFullName());
        response.setStatut(order.getStatus());
        response.setMontantTotal(order.getTotalAmount());
        response.setAdresseLivraison(order.getDeliveryAddress());
        response.setDateCreation(order.getCreatedAt());
        response.setDateModification(order.getUpdatedAt());

        List<CommandeItemResponse> items = order.getOrderItems().stream()
                .map(this::mapOrderItemToResponse)
                .collect(Collectors.toList());
        response.setArticles(items);

        return response;

    }

    private CommandeItemResponse mapOrderItemToResponse(OrderItem orderItem) {
        CommandeItemResponse response = new CommandeItemResponse();
        response.setId(orderItem.getId());
        response.setProduitId(orderItem.getProduct().getId());
        response.setNomProduit(orderItem.getProduct().getName());
        response.setNomBoutique(orderItem.getProduct().getShop().getName());
        response.setQuantite(orderItem.getQuantity());
        response.setPrixUnitaire(orderItem.getUnitPrice());
        response.setPrixTotal(orderItem.getTotalPrice());
        return response;
    }
}