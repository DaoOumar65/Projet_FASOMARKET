package com.example.fasomarket.controller;

import com.example.fasomarket.dto.BoutiquePublicDTO;
import com.example.fasomarket.dto.ProductPublicDTO;
import com.example.fasomarket.dto.ProduitVarianteDTO;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import com.example.fasomarket.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProduitVarianteService produitVarianteService;

    // Boutiques publiques (seulement ACTIVE)
    @GetMapping("/boutiques")
    public ResponseEntity<?> getBoutiques(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<Shop> shops = shopRepository.findByStatus(ShopStatus.ACTIVE);
            List<BoutiquePublicDTO> boutiques = shops.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(boutiques);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/boutiques/{id}")
    public ResponseEntity<?> getBoutique(@PathVariable UUID id) {
        return shopRepository.findByIdAndStatus(id, ShopStatus.ACTIVE)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/boutiques/{id}/produits")
    public ResponseEntity<List<ProductPublicDTO>> getBoutiqueProduits(@PathVariable UUID id) {
        Shop boutique = shopRepository.findByIdAndStatus(id, ShopStatus.ACTIVE)
                .orElse(null);
        if (boutique == null) {
            return ResponseEntity.notFound().build();
        }

        List<Product> produits = productRepository.findByShopAndIsActiveTrue(boutique);
        List<ProductPublicDTO> produitsDTO = produits.stream()
                .map(this::convertProductToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produitsDTO);
    }

    // Produits publics
    @GetMapping("/produits")
    public ResponseEntity<List<ProductPublicDTO>> getProduits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) Double prixMin,
            @RequestParam(required = false) Double prixMax,
            @RequestParam(required = false) String q) {

        Pageable pageable = PageRequest.of(page, size);
        List<Product> produits;

        if (q != null && !q.isEmpty()) {
            produits = productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(q, pageable).getContent();
        } else if (categorie != null) {
            produits = productRepository.findByCategoryAndIsActiveTrue(categorie, pageable).getContent();
        } else {
            produits = productRepository.findByIsActiveTrue(pageable).getContent();
        }

        // Filtrer par prix si spécifié
        if (prixMin != null || prixMax != null) {
            produits = produits.stream()
                    .filter(p -> (prixMin == null || p.getPrice().doubleValue() >= prixMin) &&
                            (prixMax == null || p.getPrice().doubleValue() <= prixMax))
                    .toList();
        }

        List<ProductPublicDTO> produitsDTO = produits.stream()
                .map(this::convertProductToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produitsDTO);
    }

    @GetMapping("/produits/{id}")
    public ResponseEntity<ProductPublicDTO> getProduit(@PathVariable UUID id) {
        return productRepository.findByIdAndIsActiveTrue(id)
                .map(this::convertProductToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Produits par catégorie
    @GetMapping("/categories/{id}/produits")
    public ResponseEntity<List<ProductPublicDTO>> getCategorieProduits(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        List<Product> produits = productRepository
                .findByIsActiveTrueAndCategoryContainingIgnoreCase(category.getName());
        List<ProductPublicDTO> produitsDTO = produits.stream()
                .map(this::convertProductToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(produitsDTO);
    }

    // Catégories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    // Recherche globale
    @GetMapping("/recherche")
    public ResponseEntity<?> recherche(
            @RequestParam String q,
            @RequestParam(required = false) String type) {

        if (type != null) {
            switch (type) {
                case "produits":
                    List<Product> produits = productRepository.findByIsActiveTrueAndNameContainingIgnoreCase(q);
                    List<ProductPublicDTO> produitsDTO = produits.stream().limit(20).map(this::convertProductToDTO)
                            .collect(Collectors.toList());
                    return ResponseEntity
                            .ok(Map.of("produits", produitsDTO, "boutiques", List.of(), "categories", List.of()));
                case "boutiques":
                    List<Shop> shops = shopRepository.findByStatusAndNameContainingIgnoreCase(ShopStatus.ACTIVE, q);
                    List<BoutiquePublicDTO> boutiques = shops.stream().map(this::convertToDTO)
                            .collect(Collectors.toList());
                    return ResponseEntity
                            .ok(Map.of("produits", List.of(), "boutiques", boutiques, "categories", List.of()));
                case "categories":
                    List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(q);
                    return ResponseEntity
                            .ok(Map.of("produits", List.of(), "boutiques", List.of(), "categories", categories));
            }
        }

        // Recherche globale
        List<Product> produits = productRepository.findByIsActiveTrueAndNameContainingIgnoreCase(q);
        List<ProductPublicDTO> produitsDTO = produits.stream().map(this::convertProductToDTO)
                .collect(Collectors.toList());
        List<Shop> shops = shopRepository.findByStatusAndNameContainingIgnoreCase(ShopStatus.ACTIVE, q);
        List<BoutiquePublicDTO> boutiques = shops.stream().map(this::convertToDTO).collect(Collectors.toList());
        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(q);

        return ResponseEntity.ok(Map.of(
                "produits", produitsDTO,
                "boutiques", boutiques,
                "categories", categories));
    }

    @GetMapping("/produits/{id}/variantes")
    public ResponseEntity<List<ProduitVarianteDTO>> getProduitVariantes(@PathVariable UUID id) {
        try {
            List<ProduitVarianteDTO> variantes = produitVarianteService.getVariantesByProduit(id);
            return ResponseEntity.ok(variantes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private BoutiquePublicDTO convertToDTO(Shop shop) {
        BoutiquePublicDTO dto = new BoutiquePublicDTO();
        dto.setId(shop.getId());
        dto.setName(shop.getName());
        dto.setDescription(shop.getDescription());
        dto.setAddress(shop.getAddress());
        dto.setPhone(shop.getPhone());
        dto.setEmail(shop.getEmail());
        dto.setCategory(shop.getCategory());
        dto.setLogoUrl(shop.getLogoUrl());
        dto.setBannerUrl(shop.getBannerUrl());
        dto.setDelivery(shop.getDelivery());
        dto.setDeliveryFee(shop.getDeliveryFee());
        dto.setRating(shop.getRating());
        dto.setReviewsCount(shop.getReviewsCount());
        dto.setStatus(shop.getStatus().name());
        return dto;
    }

    private ProductPublicDTO convertProductToDTO(Product product) {
        ProductPublicDTO dto = new ProductPublicDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory());
        
        // Traiter les images - s'assurer qu'elles sont accessibles
        String images = product.getImages();
        if (images != null && !images.isEmpty()) {
            // Si l'image ne commence pas par http, ajouter le préfixe du serveur
            if (!images.startsWith("http")) {
                // Vérifier si c'est un chemin local ou juste un nom de fichier
                if (images.startsWith("uploads/") || images.startsWith("/uploads/")) {
                    images = "http://localhost:8081/" + images.replaceFirst("^/?", "");
                } else {
                    // Si c'est juste un nom de fichier, utiliser le service d'images
                    images = "http://localhost:8081/api/images/" + images;
                }
            }
        } else {
            // Image par défaut si aucune image
            images = "http://localhost:8081/api/images/default-product.jpg";
        }
        dto.setImages(images);
        
        dto.setStatus(product.getStatus() != null ? product.getStatus().name() : null);
        dto.setAvailable(product.getAvailable());
        dto.setFeatured(product.getFeatured());
        dto.setDiscount(product.getDiscount());
        dto.setRating(product.getRating() != null ? product.getRating().doubleValue() : null);
        dto.setReviewsCount(product.getReviewsCount());
        dto.setMinOrderQuantity(product.getMinOrderQuantity());
        dto.setSalesCount(product.getSalesCount() != null ? product.getSalesCount().intValue() : 0);
        dto.setViewsCount(product.getViewsCount() != null ? product.getViewsCount().intValue() : 0);
        dto.setCreatedAt(product.getCreatedAt());

        // Informations de la boutique
        if (product.getShop() != null) {
            dto.setShopId(product.getShop().getId());
            dto.setShopName(product.getShop().getName());
            dto.setShopLogoUrl(product.getShop().getLogoUrl());

            // Informations du vendeur
            if (product.getShop().getVendor() != null && product.getShop().getVendor().getUser() != null) {
                dto.setVendorUserId(product.getShop().getVendor().getUser().getId());
                dto.setVendorName(product.getShop().getVendor().getUser().getFullName());
            }
        }

        return dto;
    }
}