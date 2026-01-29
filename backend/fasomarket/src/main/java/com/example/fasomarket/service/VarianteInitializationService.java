package com.example.fasomarket.service;

import com.example.fasomarket.model.ProduitVariante;
import com.example.fasomarket.model.Product;
import com.example.fasomarket.repository.ProduitVarianteRepository;
import com.example.fasomarket.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VarianteInitializationService {
    // Désactivé temporairement - utilisez l'endpoint /generer pour créer les variantes
    // implements CommandLineRunner

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProduitVarianteRepository produitVarianteRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // @Override - Désactivé temporairement
    public void run(String... args) throws Exception {
        try {
            initializeVariantesFromProducts();
        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation des variantes: " + e.getMessage());
            // Ne pas faire planter l'application
        }
    }

    private void initializeVariantesFromProducts() {
        try {
            List<Product> products = productRepository.findAll();
            
            for (Product product : products) {
                // Vérifier si le produit a déjà des variantes
                if (produitVarianteRepository.findByProduit(product).isEmpty()) {
                    createVariantesForProduct(product);
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation des variantes: " + e.getMessage());
        }
    }

    private void createVariantesForProduct(Product product) {
        try {
            List<String> colors = parseJsonArray(product.getColors());
            List<String> sizes = parseJsonArray(product.getSizes());

            if (colors.isEmpty() && sizes.isEmpty()) {
                // Créer une variante par défaut
                createDefaultVariante(product);
                return;
            }

            // Si seulement des couleurs
            if (!colors.isEmpty() && sizes.isEmpty()) {
                for (String color : colors) {
                    try {
                        createVariante(product, color, null, null);
                    } catch (Exception e) {
                        System.err.println("Erreur création variante couleur " + color + ": " + e.getMessage());
                    }
                }
                return;
            }

            // Si seulement des tailles
            if (colors.isEmpty() && !sizes.isEmpty()) {
                for (String size : sizes) {
                    try {
                        createVariante(product, null, size, null);
                    } catch (Exception e) {
                        System.err.println("Erreur création variante taille " + size + ": " + e.getMessage());
                    }
                }
                return;
            }

            // Si couleurs ET tailles
            if (!colors.isEmpty() && !sizes.isEmpty()) {
                for (String color : colors) {
                    for (String size : sizes) {
                        try {
                            createVariante(product, color, size, null);
                        } catch (Exception e) {
                            System.err.println("Erreur création variante " + color + "/" + size + ": " + e.getMessage());
                        }
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Erreur création variantes pour produit " + product.getId() + ": " + e.getMessage());
            // Créer une variante par défaut en cas d'erreur
            try {
                createDefaultVariante(product);
            } catch (Exception ex) {
                System.err.println("Impossible de créer variante par défaut: " + ex.getMessage());
            }
        }
    }

    private void createVariante(Product product, String color, String size, String model) {
        ProduitVariante variante = new ProduitVariante();
        variante.setProduit(product);
        variante.setCouleur(color);
        variante.setTaille(size);
        variante.setModele(model != null ? model : "Standard");
        variante.setPrixAjustement(0.0);
        variante.setStock(product.getStockQuantity() != null ? product.getStockQuantity() / Math.max(1, getTotalVariantes(product)) : 10);
        variante.setSku(generateSku(product, color, size, model));

        produitVarianteRepository.save(variante);
    }

    private void createDefaultVariante(Product product) {
        ProduitVariante variante = new ProduitVariante();
        variante.setProduit(product);
        variante.setCouleur("Standard");
        variante.setTaille("Unique");
        variante.setModele("Standard");
        variante.setPrixAjustement(0.0);
        variante.setStock(product.getStockQuantity() != null ? product.getStockQuantity() : 10);
        variante.setSku(generateSku(product, "Standard", "Unique", "Standard"));

        produitVarianteRepository.save(variante);
    }

    private List<String> parseJsonArray(String jsonArray) {
        try {
            if (jsonArray == null || jsonArray.trim().isEmpty()) {
                return List.of();
            }
            return objectMapper.readValue(jsonArray, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private int getTotalVariantes(Product product) {
        List<String> colors = parseJsonArray(product.getColors());
        List<String> sizes = parseJsonArray(product.getSizes());
        
        if (colors.isEmpty() && sizes.isEmpty()) return 1;
        if (colors.isEmpty()) return sizes.size();
        if (sizes.isEmpty()) return colors.size();
        return colors.size() * sizes.size();
    }

    private String generateSku(Product product, String color, String size, String model) {
        StringBuilder sku = new StringBuilder();
        sku.append(product.getId().toString().substring(0, 8).toUpperCase());
        
        if (color != null && !color.isEmpty()) {
            sku.append("-").append(color.substring(0, Math.min(3, color.length())).toUpperCase());
        }
        if (size != null && !size.isEmpty()) {
            sku.append("-").append(size.toUpperCase());
        }
        if (model != null && !model.isEmpty()) {
            sku.append("-").append(model.substring(0, Math.min(3, model.length())).toUpperCase());
        }
        
        // Vérifier l'unicité et ajouter un suffixe si nécessaire
        String baseSku = sku.toString();
        String finalSku = baseSku;
        int counter = 1;
        
        while (produitVarianteRepository.existsBySku(finalSku)) {
            finalSku = baseSku + "-" + counter;
            counter++;
        }
        
        return finalSku;
    }
}