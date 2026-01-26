package com.example.fasomarket.service;

import com.example.fasomarket.dto.ProduitVarianteDTO;
import com.example.fasomarket.model.ProduitVariante;
import com.example.fasomarket.model.Product;
import com.example.fasomarket.repository.ProduitVarianteRepository;
import com.example.fasomarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProduitVarianteService {

    @Autowired
    private ProduitVarianteRepository produitVarianteRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<ProduitVarianteDTO> getVariantesByProduit(UUID produitId) {
        Product produit = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        return produitVarianteRepository.findByProduit(produit)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProduitVariante creerVariante(UUID produitId, ProduitVariante variante) {
        Product produit = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Générer SKU unique si non fourni
        if (variante.getSku() == null || variante.getSku().isEmpty()) {
            variante.setSku(genererSku(produit, variante));
        }

        // Vérifier unicité du SKU
        if (produitVarianteRepository.existsBySku(variante.getSku())) {
            throw new RuntimeException("SKU déjà existant");
        }

        variante.setProduit(produit);
        return produitVarianteRepository.save(variante);
    }

    @Transactional
    public ProduitVariante updateVariante(Long varianteId, ProduitVariante varianteUpdate) {
        ProduitVariante variante = produitVarianteRepository.findById(varianteId)
                .orElseThrow(() -> new RuntimeException("Variante non trouvée"));

        if (varianteUpdate.getCouleur() != null) variante.setCouleur(varianteUpdate.getCouleur());
        if (varianteUpdate.getTaille() != null) variante.setTaille(varianteUpdate.getTaille());
        if (varianteUpdate.getModele() != null) variante.setModele(varianteUpdate.getModele());
        if (varianteUpdate.getPrixAjustement() != null) variante.setPrixAjustement(varianteUpdate.getPrixAjustement());
        if (varianteUpdate.getStock() != null) variante.setStock(varianteUpdate.getStock());

        return produitVarianteRepository.save(variante);
    }

    @Transactional
    public void supprimerVariante(Long varianteId) {
        if (!produitVarianteRepository.existsById(varianteId)) {
            throw new RuntimeException("Variante non trouvée");
        }
        produitVarianteRepository.deleteById(varianteId);
    }

    private String genererSku(Product produit, ProduitVariante variante) {
        StringBuilder sku = new StringBuilder();
        sku.append(produit.getId().toString().substring(0, 8).toUpperCase());
        
        if (variante.getCouleur() != null) {
            sku.append("-").append(variante.getCouleur().substring(0, Math.min(3, variante.getCouleur().length())).toUpperCase());
        }
        if (variante.getTaille() != null) {
            sku.append("-").append(variante.getTaille().toUpperCase());
        }
        if (variante.getModele() != null) {
            sku.append("-").append(variante.getModele().substring(0, Math.min(3, variante.getModele().length())).toUpperCase());
        }
        
        return sku.toString();
    }

    private ProduitVarianteDTO convertToDTO(ProduitVariante variante) {
        ProduitVarianteDTO dto = new ProduitVarianteDTO();
        dto.setId(variante.getId().toString());
        dto.setProduitId(variante.getProduit().getId().toString());
        dto.setCouleur(variante.getCouleur());
        dto.setTaille(variante.getTaille());
        dto.setModele(variante.getModele());
        dto.setPrixAjustement(variante.getPrixAjustement());
        dto.setStock(variante.getStock());
        dto.setSku(variante.getSku());
        return dto;
    }

    public List<ProduitVarianteDTO> genererVariantesFromProduct(UUID produitId) {
        Product produit = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Supprimer les variantes existantes
        List<ProduitVariante> existingVariantes = produitVarianteRepository.findByProduit(produit);
        produitVarianteRepository.deleteAll(existingVariantes);

        // Générer nouvelles variantes
        return createVariantesForProduct(produit);
    }

    private List<ProduitVarianteDTO> createVariantesForProduct(Product product) {
        try {
            List<String> colors = parseJsonArray(product.getColors());
            List<String> sizes = parseJsonArray(product.getSizes());
            List<ProduitVarianteDTO> variantes = new java.util.ArrayList<>();

            if (colors.isEmpty() && sizes.isEmpty()) {
                variantes.add(createVarianteDTO(product, "Standard", "Unique", "Standard"));
                return variantes;
            }

            if (!colors.isEmpty() && sizes.isEmpty()) {
                for (String color : colors) {
                    variantes.add(createVarianteDTO(product, color, null, "Standard"));
                }
                return variantes;
            }

            if (colors.isEmpty() && !sizes.isEmpty()) {
                for (String size : sizes) {
                    variantes.add(createVarianteDTO(product, null, size, "Standard"));
                }
                return variantes;
            }

            for (String color : colors) {
                for (String size : sizes) {
                    variantes.add(createVarianteDTO(product, color, size, "Standard"));
                }
            }

            return variantes;
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération variantes: " + e.getMessage());
        }
    }

    private ProduitVarianteDTO createVarianteDTO(Product product, String color, String size, String model) {
        ProduitVariante variante = new ProduitVariante();
        variante.setProduit(product);
        variante.setCouleur(color);
        variante.setTaille(size);
        variante.setModele(model);
        variante.setPrixAjustement(java.math.BigDecimal.ZERO);
        variante.setStock(product.getStockQuantity() != null ? product.getStockQuantity() / Math.max(1, getTotalVariantes(product)) : 10);
        variante.setSku(genererSku(product, variante));

        variante = produitVarianteRepository.save(variante);
        return convertToDTO(variante);
    }

    private List<String> parseJsonArray(String jsonArray) {
        try {
            if (jsonArray == null || jsonArray.trim().isEmpty()) {
                return java.util.List.of();
            }
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(jsonArray, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (Exception e) {
            return java.util.List.of();
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
}