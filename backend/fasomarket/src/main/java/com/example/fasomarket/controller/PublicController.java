package com.example.fasomarket.controller;

import com.example.fasomarket.dto.BoutiquePublicDTO;
import com.example.fasomarket.dto.ProductPublicDTO;
import com.example.fasomarket.dto.ProduitVarianteDTO;
import com.example.fasomarket.dto.VariantePublicDTO;
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
import java.math.BigDecimal;
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
    public ResponseEntity<Map<String, Object>> getProduit(@PathVariable UUID id) {
        try {
            Product produit = productRepository.findByIdAndIsActiveTrue(id).orElse(null);
            if (produit == null) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", produit.getId());
            response.put("nom", produit.getName());
            response.put("description", produit.getDescription());
            response.put("prix", produit.getPrice());
            response.put("quantiteStock", produit.getStockQuantity());
            response.put("category", produit.getCategory());
            response.put("available", produit.getAvailable());
            
            // ✅ Gestion correcte des images
            if (produit.getImages() != null && !produit.getImages().isEmpty()) {
                String[] imageUrls = produit.getImages().split(",");
                List<String> imagesList = java.util.Arrays.stream(imageUrls)
                    .map(String::trim)
                    .filter(url -> !url.isEmpty())
                    .collect(Collectors.toList());
                response.put("images", imagesList);
            } else {
                response.put("images", new java.util.ArrayList<>());
            }
            
            // Boutique info
            Map<String, Object> boutique = new java.util.HashMap<>();
            boutique.put("nom", produit.getShop() != null ? produit.getShop().getName() : "MaroShop");
            boutique.put("id", produit.getShop() != null ? produit.getShop().getId() : null);
            response.put("boutique", boutique);
            
            // Rating et reviews
            if (produit.getRating() != null) {
                response.put("rating", produit.getRating().doubleValue());
            }
            response.put("reviewsCount", produit.getReviewsCount());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
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
    public ResponseEntity<List<VariantePublicDTO>> getProduitVariantes(@PathVariable UUID id) {
        try {
            List<ProduitVariante> variantes = produitVarianteService.getVariantesByProduitId(id.toString());
            List<VariantePublicDTO> variantesDTO = variantes.stream()
                    .map(this::convertVarianteToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(variantesDTO);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
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
        return dto;
    }

    private ProductPublicDTO convertProductToDTO(Product product) {
        ProductPublicDTO dto = new ProductPublicDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImages(product.getImages());
        dto.setCategory(product.getCategory());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setAvailable(product.getAvailable());
        if (product.getRating() != null) {
            dto.setRating(product.getRating().doubleValue());
        }
        dto.setReviewsCount(product.getReviewsCount());
        dto.setShopName(product.getShop() != null ? product.getShop().getName() : null);
        dto.setShopId(product.getShop() != null ? product.getShop().getId() : null);
        return dto;
    }

    private VariantePublicDTO convertVarianteToDTO(ProduitVariante variante) {
        VariantePublicDTO dto = new VariantePublicDTO();
        dto.setId(variante.getId());
        dto.setProduitId(variante.getProduit() != null ? variante.getProduit().getId().toString() : null);
        dto.setCouleur(variante.getCouleur());
        dto.setTaille(variante.getTaille());
        dto.setModele(variante.getModele());
        dto.setPrixAjustement(BigDecimal.valueOf(variante.getPrixAjustement()));
        dto.setStock(variante.getStock());
        dto.setSku(variante.getSku());
        dto.setCreatedAt(variante.getCreatedAt());
        dto.setUpdatedAt(variante.getUpdatedAt());
        
        // Nouvelles variantes
        dto.setPoids(variante.getPoids());
        dto.setDimensions(variante.getDimensions());
        dto.setMateriau(variante.getMateriau());
        dto.setFinition(variante.getFinition());
        dto.setCapacite(variante.getCapacite());
        dto.setPuissance(variante.getPuissance());
        dto.setParfum(variante.getParfum());
        dto.setAgeCible(variante.getAgeCible());
        dto.setGenre(variante.getGenre());
        dto.setSaison(variante.getSaison());
        
        return dto;
    }
}