package com.example.fasomarket.controller;

import com.example.fasomarket.repository.ProductRepository;
import com.example.fasomarket.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/vendeur/produits")
public class VendeurProduitController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduit(@PathVariable String id) {
        try {
            UUID produitId = UUID.fromString(id);
            
            // Charger avec toutes les relations
            Optional<Product> produitOpt = productRepository.findByIdWithAllRelations(produitId);
            
            if (!produitOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Produit non trouvé",
                    "id", id
                ));
            }

            Product produit = produitOpt.get();
            Map<String, Object> response = buildProductResponse(produit);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "ID invalide",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Erreur getProduit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Erreur serveur",
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduit(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            if (id == null || id.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false, 
                    "message", "ID invalide"
                ));
            }

            UUID produitId = UUID.fromString(id);
            
            // Charger avec toutes les relations
            Optional<Product> produitOpt = productRepository.findByIdWithAllRelations(produitId);
            
            if (!produitOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false, 
                    "message", "Produit non trouvé"
                ));
            }

            Product produit = produitOpt.get();

            // Appliquer les modifications
            if (request != null) {
                updateProductFields(produit, request);
                produit = productRepository.save(produit);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Produit mis à jour avec succès");
            response.put("produit", buildProductResponse(produit));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Données invalides: " + e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Erreur updateProduit: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Erreur serveur",
                "message", e.getMessage()
            ));
        }
    }

    // Méthode helper pour construire la réponse produit
    private Map<String, Object> buildProductResponse(Product produit) {
        Map<String, Object> response = new HashMap<>();
        
        // Informations de base
        response.put("id", produit.getId());
        response.put("nom", produit.getName());
        response.put("description", produit.getDescription());
        response.put("prix", produit.getPrice());
        response.put("stock", produit.getStockQuantity());
        response.put("status", produit.getStatus() != null ? produit.getStatus().name() : "ACTIVE");
        response.put("statut", produit.getStatus() != null ? produit.getStatus().name() : "ACTIVE");
        response.put("actif", produit.getIsActive());
        response.put("disponible", produit.getAvailable());
        
        // Images
        List<String> images = new ArrayList<>();
        if (produit.getImages() != null && !produit.getImages().isEmpty()) {
            images = Arrays.asList(produit.getImages().split(","));
        }
        response.put("images", images);
        
        // Catégorie
        response.put("categorie", produit.getCategory());
        if (produit.getCategoryEntity() != null) {
            Map<String, Object> categorieObj = new HashMap<>();
            categorieObj.put("id", produit.getCategoryEntity().getId());
            categorieObj.put("nom", produit.getCategoryEntity().getNom());
            response.put("categorieObj", categorieObj);
        }
        
        // Boutique
        if (produit.getShop() != null) {
            response.put("boutiqueId", produit.getShop().getId());
            response.put("nomBoutique", produit.getShop().getName());
        }
        
        // Détails additionnels
        response.put("sku", produit.getSku());
        response.put("poids", produit.getWeight());
        response.put("dimensions", produit.getDimensions());
        response.put("couleur", produit.getColor());
        response.put("colors", produit.getColors());
        response.put("taille", produit.getSize());
        response.put("sizes", produit.getSizes());
        response.put("marque", produit.getBrand());
        response.put("materiau", produit.getMaterial());
        response.put("origine", produit.getOrigin());
        response.put("remise", produit.getDiscount());
        response.put("tags", produit.getTags());
        
        // Dates
        response.put("dateCreation", produit.getCreatedAt());
        response.put("dateModification", produit.getUpdatedAt());
        
        // Stats
        response.put("note", produit.getRating());
        response.put("nombreAvis", produit.getReviewsCount());
        response.put("nombreVentes", 0); // À implémenter
        
        return response;
    }

    // Méthode helper pour mettre à jour les champs
    private void updateProductFields(Product produit, Map<String, Object> request) {
        if (request.containsKey("nom")) {
            produit.setName(String.valueOf(request.get("nom")));
        }
        
        if (request.containsKey("description")) {
            produit.setDescription(String.valueOf(request.get("description")));
        }
        
        if (request.containsKey("prix")) {
            try {
                Double prix = Double.valueOf(String.valueOf(request.get("prix")));
                produit.setPrice(java.math.BigDecimal.valueOf(prix));
            } catch (Exception e) {
                System.err.println("Erreur conversion prix: " + e.getMessage());
            }
        }
        
        if (request.containsKey("stock") || request.containsKey("quantiteStock")) {
            try {
                Object stockValue = request.getOrDefault("stock", request.get("quantiteStock"));
                Integer stock = Integer.valueOf(String.valueOf(stockValue));
                produit.setStockQuantity(stock);
                
                // Mettre à jour la disponibilité
                produit.setAvailable(stock > 0);
            } catch (Exception e) {
                System.err.println("Erreur conversion stock: " + e.getMessage());
            }
        }
        
        if (request.containsKey("status") || request.containsKey("statut")) {
            try {
                String statusStr = String.valueOf(request.getOrDefault("status", request.get("statut")));
                produit.setStatus(com.example.fasomarket.model.ProductStatus.valueOf(statusStr.toUpperCase()));
            } catch (Exception e) {
                System.err.println("Erreur conversion status: " + e.getMessage());
            }
        }
        
        if (request.containsKey("actif")) {
            try {
                Boolean actif = Boolean.valueOf(String.valueOf(request.get("actif")));
                produit.setIsActive(actif);
            } catch (Exception e) {
                System.err.println("Erreur conversion actif: " + e.getMessage());
            }
        }
        
        if (request.containsKey("images")) {
            Object imagesObj = request.get("images");
            if (imagesObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> imagesList = (List<String>) imagesObj;
                produit.setImages(String.join(",", imagesList));
            } else if (imagesObj instanceof String) {
                produit.setImages((String) imagesObj);
            }
        }
        
        if (request.containsKey("categorie")) {
            produit.setCategory(String.valueOf(request.get("categorie")));
        }
        
        if (request.containsKey("sku")) {
            produit.setSku(String.valueOf(request.get("sku")));
        }
        
        if (request.containsKey("couleur")) {
            produit.setColor(String.valueOf(request.get("couleur")));
        }
        
        if (request.containsKey("taille")) {
            produit.setSize(String.valueOf(request.get("taille")));
        }
        
        if (request.containsKey("marque")) {
            produit.setBrand(String.valueOf(request.get("marque")));
        }
        
        if (request.containsKey("remise")) {
            try {
                Double remise = Double.valueOf(String.valueOf(request.get("remise")));
                produit.setDiscount(java.math.BigDecimal.valueOf(remise));
            } catch (Exception e) {
                System.err.println("Erreur conversion remise: " + e.getMessage());
            }
        }
    }
}