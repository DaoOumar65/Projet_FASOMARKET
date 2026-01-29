package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderNotificationService orderNotificationService;

    @Autowired
    private ProduitVarianteService produitVarianteService;

    @Transactional
    public void recalculerTotauxCommandes() {
        List<Order> ordersWithZeroTotal = orderRepository.findByTotalAmount(BigDecimal.ZERO);

        for (Order order : ordersWithZeroTotal) {
            BigDecimal total = BigDecimal.ZERO;

            if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                for (OrderItem item : order.getOrderItems()) {
                    BigDecimal itemTotal = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    total = total.add(itemTotal);
                }

                order.setTotalAmount(total);
                orderRepository.save(order);
            }
        }
    }

    public BigDecimal calculerTotalCommande(Order order) {
        BigDecimal total = BigDecimal.ZERO;

        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                BigDecimal itemTotal = item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
            }
        }

        return total;
    }

    @Transactional
    public CommandeResponse creerCommande(UUID clientId, CreerCommandeRequest request) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        List<Cart> items = cartRepository.findByClient(client);
        if (items.isEmpty()) {
            throw new RuntimeException("Panier vide");
        }

        Order order = new Order();
        order.setClient(client);
        order.setStatus(OrderStatus.PENDING);
        order.setDeliveryAddress(request.getAdresseLivraison());
        order.setNeedsDelivery(request.getNeedsDelivery());
        order.setDeliveryPhone(request.getNumeroTelephone());

        BigDecimal total = BigDecimal.ZERO;
        for (Cart item : items) {
            BigDecimal prixUnitaire = item.getProduct().getPrice();

            // Ajouter le prix d'ajustement de la variante si présente
            if (item.getVarianteId() != null) {
                try {
                    ProduitVariante variante = produitVarianteService.getVarianteById(item.getVarianteId().toString());
                    prixUnitaire = prixUnitaire.add(BigDecimal.valueOf(variante.getPrixAjustement()));
                } catch (Exception e) {
                    // Ignorer si variante non trouvée
                }
            }

            BigDecimal itemTotal = prixUnitaire.multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(prixUnitaire);
            orderItem.setVarianteId(item.getVarianteId());
            orderItem.setSelectedColor(item.getSelectedColor());
            orderItem.setSelectedSize(item.getSelectedSize());
            orderItem.setSelectedModel(item.getSelectedModel());
            order.getOrderItems().add(orderItem);
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);
        cartRepository.deleteByClient(client);

        return mapToCommandeResponse(savedOrder);
    }

    public List<CommandeResponse> obtenirMesCommandes(UUID clientId) {
        List<Order> orders = orderRepository.findByClientIdWithDetailsOrderByCreatedAtDesc(clientId);
        return orders.stream().map(this::mapToCommandeResponse).collect(Collectors.toList());
    }

    public CommandeResponse obtenirCommande(UUID clientId, UUID commandeId) {
        Order order = orderRepository.findByIdWithDetails(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!order.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Non autorisé");
        }

        return mapToCommandeResponse(order);
    }

    public List<CommandeResponse> obtenirCommandesVendeur(UUID vendorUserId) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Vendeur non trouvé"));

        List<Order> orders = orderRepository.findOrdersByVendor(vendor);
        return orders.stream().map(this::mapToCommandeResponse).collect(Collectors.toList());
    }

    public List<CommandeResponse> obtenirCommandesVendeurParStatut(UUID vendorUserId, OrderStatus statut) {
        User vendor = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Vendeur non trouvé"));

        List<Order> orders = orderRepository.findOrdersByVendorAndStatus(vendor, statut);
        return orders.stream().map(this::mapToCommandeResponse).collect(Collectors.toList());
    }

    @Transactional
    public CommandeResponse changerStatutCommandeVendeur(UUID vendorUserId, UUID commandeId, OrderStatus statut) {
        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        // Vérifier que le vendeur a des produits dans cette commande
        boolean hasProducts = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getShop().getVendor().getUser().getId().equals(vendorUserId));

        if (!hasProducts) {
            throw new RuntimeException("Non autorisé");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(statut);
        Order savedOrder = orderRepository.save(order);

        orderNotificationService.notifierChangementStatut(savedOrder, oldStatus);

        return mapToCommandeResponse(savedOrder);
    }

    @Transactional
    public CommandeResponse changerStatutCommande(UUID commandeId, OrderStatus statut) {
        Order order = orderRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(statut);
        Order savedOrder = orderRepository.save(order);

        orderNotificationService.notifierChangementStatut(savedOrder, oldStatus);

        return mapToCommandeResponse(savedOrder);
    }

    private CommandeResponse mapToCommandeResponse(Order order) {
        CommandeResponse response = new CommandeResponse();
        response.setId(order.getId());
        response.setNumeroCommande("CMD-" + order.getId().toString().substring(0, 8));
        response.setStatut(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setDateCommande(order.getCreatedAt());
        response.setAdresseLivraison(order.getDeliveryAddress());
        response.setNeedsDelivery(order.getNeedsDelivery());
        response.setTelephoneLivraison(order.getDeliveryPhone());
        response.setNomClient(order.getClient().getFullName());

        // Convert OrderItems to articles
        List<Object> articles = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Map<String, Object> article = new HashMap<>();
                article.put("id", item.getId());
                article.put("nomProduit", item.getProduct().getName());
                article.put("quantite", item.getQuantity());
                article.put("prixUnitaire", item.getUnitPrice());
                article.put("prixTotal", item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                article.put("nomBoutique", item.getProduct().getShop().getName());

                // Ajouter les infos de variante
                article.put("varianteId", item.getVarianteId());
                article.put("couleurSelectionnee", item.getSelectedColor());
                article.put("tailleSelectionnee", item.getSelectedSize());
                article.put("modeleSelectionne", item.getSelectedModel());
                articles.add(article);
            }
        }
        response.setArticles(articles);

        return response;
    }
}