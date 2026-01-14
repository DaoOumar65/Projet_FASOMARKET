package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
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
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public PanierItemResponse ajouterAuPanier(UUID clientId, AjouterPanierRequest request) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        if (!client.getRole().equals(Role.CLIENT)) {
            throw new RuntimeException("Seuls les clients peuvent ajouter au panier");
        }

        Product product = productRepository.findById(request.getProduitId())
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        if (!product.getIsActive() || !product.getAvailable()) {
            throw new RuntimeException("Produit non disponible");
        }

        if (product.getStockQuantity() < request.getQuantite()) {
            throw new RuntimeException("Stock insuffisant");
        }

        // Vérifier si le produit est déjà dans le panier
        cartRepository.findByClientAndProduct(client, product)
                .ifPresentOrElse(
                    existingCart -> {
                        int newQuantity = existingCart.getQuantity() + request.getQuantite();
                        if (product.getStockQuantity() < newQuantity) {
                            throw new RuntimeException("Stock insuffisant pour cette quantité");
                        }
                        existingCart.setQuantity(newQuantity);
                        cartRepository.save(existingCart);
                    },
                    () -> {
                        Cart cart = new Cart(client, product, request.getQuantite());
                        cartRepository.save(cart);
                    }
                );

        Cart savedCart = cartRepository.findByClientAndProduct(client, product).get();
        return mapCartToResponse(savedCart);
    }

    public List<PanierItemResponse> obtenirPanier(UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        return cartRepository.findByClient(client)
                .stream()
                .map(this::mapCartToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void supprimerDuPanier(UUID clientId, UUID cartItemId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Cart cart = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Article non trouvé dans le panier"));

        if (!cart.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Non autorisé à supprimer cet article");
        }

        cartRepository.delete(cart);
    }

    @Transactional
    public void viderPanier(UUID clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        cartRepository.deleteByClient(client);
    }

    private PanierItemResponse mapCartToResponse(Cart cart) {
        PanierItemResponse response = new PanierItemResponse();
        response.setId(cart.getId());
        response.setProduitId(cart.getProduct().getId());
        response.setNomProduit(cart.getProduct().getName());
        response.setNomBoutique(cart.getProduct().getShop().getName());
        response.setPrixUnitaire(cart.getProduct().getPrice());
        response.setQuantite(cart.getQuantity());
        response.setPrixTotal(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
        response.setImageProduit(cart.getProduct().getImages());
        response.setDisponible(cart.getProduct().getAvailable() && cart.getProduct().getStockQuantity() >= cart.getQuantity());
        response.setDateAjout(cart.getCreatedAt());
        return response;
    }
}