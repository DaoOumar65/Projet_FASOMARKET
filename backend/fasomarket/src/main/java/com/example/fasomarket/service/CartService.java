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
    
    @Autowired
    private ImageUrlService imageUrlService;

    @Autowired
    private ProduitVarianteRepository produitVarianteRepository;

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

        // Gérer les variantes si spécifiées
        ProduitVariante variante = null;
        BigDecimal prixUnitaire = product.getPrice();
        int stockDisponible = product.getStockQuantity();
        
        if (request.getVarianteId() != null) {
            variante = produitVarianteRepository.findById(request.getVarianteId())
                    .orElseThrow(() -> new RuntimeException("Variante non trouvée"));
            
            if (!variante.getProduit().getId().equals(product.getId())) {
                throw new RuntimeException("Variante ne correspond pas au produit");
            }
            
            prixUnitaire = product.getPrice().add(BigDecimal.valueOf(variante.getPrixAjustement()));
            stockDisponible = variante.getStock();
            
            // Vérifier le stock de la variante
            if (stockDisponible < request.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour cette variante");
            }
        } else {
            // Vérifier le stock du produit principal
            if (stockDisponible < request.getQuantite()) {
                throw new RuntimeException("Stock insuffisant");
            }
        }

        // Vérifier si le produit est déjà dans le panier avec les mêmes options
        Cart existingCart = cartRepository.findByClientAndProduct(client, product)
                .filter(cart -> 
                    java.util.Objects.equals(cart.getSelectedColor(), request.getCouleurSelectionnee()) &&
                    java.util.Objects.equals(cart.getSelectedSize(), request.getTailleSelectionnee()) &&
                    java.util.Objects.equals(cart.getSelectedModel(), request.getModeleSelectionne()) &&
                    java.util.Objects.equals(cart.getVarianteId(), request.getVarianteId())
                )
                .orElse(null);

        if (existingCart != null) {
            // Augmenter la quantité
            int newQuantity = existingCart.getQuantity() + request.getQuantite();
            if (stockDisponible < newQuantity) {
                throw new RuntimeException("Stock insuffisant pour cette quantité");
            }
            existingCart.setQuantity(newQuantity);
            cartRepository.save(existingCart);
        } else {
            // Créer nouvel article avec options
            Cart cart = new Cart(client, product, request.getQuantite());
            cart.setSelectedColor(request.getCouleurSelectionnee());
            cart.setSelectedSize(request.getTailleSelectionnee());
            cart.setSelectedModel(request.getModeleSelectionne());
            cart.setVarianteId(request.getVarianteId());
            
            // Options personnalisées en JSON
            if (request.getOptionsPersonnalisees() != null && !request.getOptionsPersonnalisees().isEmpty()) {
                cart.setCustomOptions(convertOptionsToJson(request.getOptionsPersonnalisees()));
            }
            
            cartRepository.save(cart);
        }

        Cart savedCart = cartRepository.findByClientAndProduct(client, product)
                .stream()
                .filter(cart -> 
                    java.util.Objects.equals(cart.getSelectedColor(), request.getCouleurSelectionnee()) &&
                    java.util.Objects.equals(cart.getSelectedSize(), request.getTailleSelectionnee()) &&
                    java.util.Objects.equals(cart.getSelectedModel(), request.getModeleSelectionne()) &&
                    java.util.Objects.equals(cart.getVarianteId(), request.getVarianteId())
                )
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Erreur lors de l'ajout au panier"));
        return mapCartToResponse(savedCart);
    }

    private String convertOptionsToJson(java.util.Map<String, String> options) {
        try {
            StringBuilder json = new StringBuilder("{");
            options.forEach((key, value) -> {
                if (json.length() > 1) json.append(",");
                json.append("\"").append(key).append("\":\"").append(value).append("\"");
            });
            json.append("}");
            return json.toString();
        } catch (Exception e) {
            return "{}";
        }
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
        response.setImagesProduit(imageUrlService.buildImagesArray(cart.getProduct().getImages()));
        response.setDisponible(cart.getProduct().getAvailable() && cart.getProduct().getStockQuantity() >= cart.getQuantity());
        response.setDateAjout(cart.getCreatedAt());
        
        // Options sélectionnées
        response.setCouleurSelectionnee(cart.getSelectedColor());
        response.setTailleSelectionnee(cart.getSelectedSize());
        response.setModeleSelectionne(cart.getSelectedModel());
        response.setOptionsPersonnalisees(cart.getCustomOptions());
        
        return response;
    }
}