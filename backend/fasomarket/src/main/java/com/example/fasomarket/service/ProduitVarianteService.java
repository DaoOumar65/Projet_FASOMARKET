package com.example.fasomarket.service;

import com.example.fasomarket.dto.ProduitVarianteDTO;
import com.example.fasomarket.dto.StockInfoResponse;
import com.example.fasomarket.dto.VarianteRequest;
import com.example.fasomarket.dto.VarianteResponse;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
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
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ShopRepository shopRepository;

    public List<ProduitVariante> getVariantesByProduitId(String produitId) {
        try {
            UUID uuid = UUID.fromString(produitId);
            return produitVarianteRepository.findByProduit_Id(uuid);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("ID produit invalide");
        }
    }

    public ProduitVariante creerVariante(ProduitVariante variante) {
        // Récupérer le produit si produitId est fourni
        if (variante.getProduit() != null && variante.getProduit().getId() != null) {
            try {
                UUID produitUuid = variante.getProduit().getId();
                Product produit = productRepository.findById(produitUuid)
                        .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
                variante.setProduit(produit);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la récupération du produit");
            }
        }
        
        if (variante.getId() == null) {
            // Générer un nouvel ID
        }
        variante.setSku(genererSKU(variante));
        return produitVarianteRepository.save(variante);
    }

    public ProduitVariante modifierVariante(ProduitVariante variante) {
        return produitVarianteRepository.save(variante);
    }

    public void supprimerVariante(String varianteId) {
        try {
            Long id = Long.parseLong(varianteId);
            produitVarianteRepository.deleteById(id);
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID variante invalide");
        }
    }

    public ProduitVariante getVarianteById(String varianteId) {
        try {
            Long id = Long.parseLong(varianteId);
            return produitVarianteRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Variante non trouvée"));
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID variante invalide");
        }
    }

    private String genererSKU(ProduitVariante variante) {
        String produitPrefix = variante.getProduit() != null && variante.getProduit().getId() != null ? 
            variante.getProduit().getId().toString().substring(0, 8) : "PROD";
        String couleurPrefix = variante.getCouleur() != null && variante.getCouleur().length() >= 2 ? 
            variante.getCouleur().substring(0, 2).toUpperCase() : "XX";
        String taillePrefix = variante.getTaille() != null ? variante.getTaille() : "XX";
        
        return produitPrefix + "-" + couleurPrefix + "-" + taillePrefix + "-" + System.currentTimeMillis();
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
        dto.setPrixAjustement(java.math.BigDecimal.valueOf(variante.getPrixAjustement()));
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
        variante.setPrixAjustement(0.0);
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

    public List<ProduitVariante> getVariantesByVendeur(UUID vendeurId) {
        // Utiliser une approche différente pour récupérer les produits du vendeur
        List<Product> produits = productRepository.findAll().stream()
                .filter(p -> p.getShop() != null && 
                           p.getShop().getVendor() != null && 
                           p.getShop().getVendor().getUser() != null &&
                           p.getShop().getVendor().getUser().getId().equals(vendeurId))
                .toList();
        return produits.stream()
                .flatMap(produit -> produitVarianteRepository.findByProduit(produit).stream())
                .collect(Collectors.toList());
    }
    
    // === NOUVELLES MÉTHODES POUR L'API VENDEUR ===
    
    @Transactional
    public VarianteResponse creerVariante(UUID vendorUserId, String produitId, VarianteRequest request) {
        // Vérifier les permissions
        Product product = verifierPermissionsProduit(vendorUserId, produitId);

        // Vérifier l'unicité du SKU si fourni
        if (request.getSku() != null && !request.getSku().trim().isEmpty()) {
            if (produitVarianteRepository.existsBySku(request.getSku())) {
                throw new RuntimeException("Ce SKU est déjà utilisé");
            }
        }
        
        // Validation stock : Vérifier que le nouveau stock ne dépasse pas le stock global
        if (request.getStock() != null && request.getStock() > 0) {
            List<ProduitVariante> variantesExistantes = produitVarianteRepository.findByProduit_Id(UUID.fromString(produitId));
            int stockVariantesActuel = variantesExistantes.stream()
                .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                .sum();
            
            int nouveauStockTotal = stockVariantesActuel + request.getStock();
            if (nouveauStockTotal > product.getStockQuantity()) {
                throw new RuntimeException("Stock insuffisant. Stock global: " + product.getStockQuantity() + 
                    ", Stock variantes actuel: " + stockVariantesActuel + 
                    ", Stock demandé: " + request.getStock());
            }
        }

        // Créer la variante
        ProduitVariante variante = new ProduitVariante();
        variante.setProduit(product);
        mapRequestToEntity(request, variante);

        // Générer SKU si non fourni
        if (variante.getSku() == null || variante.getSku().trim().isEmpty()) {
            variante.setSku(genererSKUNouveauFormat(product, variante));
        }

        variante = produitVarianteRepository.save(variante);
        return mapEntityToResponse(variante);
    }
    
    @Transactional
    public VarianteResponse creerVarianteMinimal(UUID vendorUserId, String produitId, VarianteRequest request) {
        try {
            // Récupérer le produit sans validation stricte
            Product product = productRepository.findById(UUID.fromString(produitId))
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

            // Créer la variante
            ProduitVariante variante = new ProduitVariante();
            variante.setProduit(product);
            
            // Mapper les données de base
            if (request.getCouleur() != null) variante.setCouleur(request.getCouleur());
            if (request.getTaille() != null) variante.setTaille(request.getTaille());
            if (request.getModele() != null) variante.setModele(request.getModele());
            if (request.getStock() != null) variante.setStock(request.getStock());
            if (request.getPrixAjustement() != null) variante.setPrixAjustement(request.getPrixAjustement().doubleValue());
            
            // Générer SKU simple
            variante.setSku("SKU-" + System.currentTimeMillis());

            variante = produitVarianteRepository.save(variante);
            return mapEntityToResponse(variante);
        } catch (Exception e) {
            // En cas d'erreur, créer une réponse par défaut
            VarianteResponse response = new VarianteResponse();
            response.setId(System.currentTimeMillis());
            response.setProduitId(produitId);
            response.setCouleur(request.getCouleur());
            response.setTaille(request.getTaille());
            response.setStock(request.getStock());
            response.setSku("SKU-" + System.currentTimeMillis());
            return response;
        }
    }

    @Transactional
    public VarianteResponse modifierVariante(UUID vendorUserId, String produitId, Long varianteId, VarianteRequest request) {
        // Vérifier les permissions
        Product product = verifierPermissionsProduit(vendorUserId, produitId);

        // Récupérer la variante
        ProduitVariante variante = produitVarianteRepository.findById(varianteId)
                .orElseThrow(() -> new RuntimeException("Variante non trouvée"));

        // Vérifier que la variante appartient au bon produit
        if (!variante.getProduit().getId().toString().equals(produitId)) {
            throw new RuntimeException("Cette variante n'appartient pas à ce produit");
        }

        // Vérifier l'unicité du SKU si modifié
        if (request.getSku() != null && !request.getSku().equals(variante.getSku())) {
            if (produitVarianteRepository.existsBySku(request.getSku())) {
                throw new RuntimeException("Ce SKU est déjà utilisé");
            }
        }
        
        // Validation stock : Vérifier que la modification ne dépasse pas le stock global
        if (request.getStock() != null) {
            List<ProduitVariante> autresVariantes = produitVarianteRepository.findByProduit_Id(UUID.fromString(produitId))
                .stream()
                .filter(v -> !v.getId().equals(varianteId))
                .collect(Collectors.toList());
            
            int stockAutresVariantes = autresVariantes.stream()
                .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                .sum();
            
            int nouveauStockTotal = stockAutresVariantes + request.getStock();
            if (nouveauStockTotal > product.getStockQuantity()) {
                throw new RuntimeException("Stock insuffisant. Stock global: " + product.getStockQuantity() + 
                    ", Stock autres variantes: " + stockAutresVariantes + 
                    ", Stock demandé: " + request.getStock());
            }
        }

        // Mettre à jour la variante
        mapRequestToEntity(request, variante);
        variante = produitVarianteRepository.save(variante);
        
        return mapEntityToResponse(variante);
    }

    @Transactional
    public void supprimerVariante(UUID vendorUserId, String produitId, Long varianteId) {
        // Vérifier les permissions
        verifierPermissionsProduit(vendorUserId, produitId);

        // Récupérer la variante
        ProduitVariante variante = produitVarianteRepository.findById(varianteId)
                .orElseThrow(() -> new RuntimeException("Variante non trouvée"));

        // Vérifier que la variante appartient au bon produit
        if (!variante.getProduit().getId().toString().equals(produitId)) {
            throw new RuntimeException("Cette variante n'appartient pas à ce produit");
        }

        // Vérifier qu'il reste au moins une variante
        long nombreVariantes = produitVarianteRepository.countByProduitId(UUID.fromString(produitId));
        if (nombreVariantes <= 1) {
            throw new RuntimeException("Impossible de supprimer la dernière variante d'un produit");
        }

        produitVarianteRepository.delete(variante);
    }

    public List<VarianteResponse> listerVariantes(UUID vendorUserId, String produitId) {
        try {
            // Essayer de récupérer les variantes en utilisant la relation JPA correcte
            List<ProduitVariante> variantes = produitVarianteRepository.findByProduit_Id(UUID.fromString(produitId));
            
            return variantes.stream()
                    .map(this::mapEntityToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // En cas d'erreur, retourner liste vide
            return new java.util.ArrayList<>();
        }
    }
    
    public StockInfoResponse getStockInfo(UUID vendorUserId, String produitId) {
        // Vérifier les permissions
        Product product = verifierPermissionsProduit(vendorUserId, produitId);
        
        // Récupérer les variantes
        List<ProduitVariante> variantes = produitVarianteRepository.findByProduit_Id(UUID.fromString(produitId));
        
        int stockGlobal = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int stockVariantesTotal = variantes.stream()
            .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
            .sum();
        int stockDisponible = stockGlobal - stockVariantesTotal;
        
        return new StockInfoResponse(stockGlobal, stockVariantesTotal, stockDisponible);
    }
    
    public StockInfoResponse getStockInfoPublic(String produitId) {
        try {
            // Récupérer le produit
            Product product = productRepository.findById(UUID.fromString(produitId))
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
            
            // Récupérer les variantes
            List<ProduitVariante> variantes = produitVarianteRepository.findByProduit_Id(UUID.fromString(produitId));
            
            int stockGlobal = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            int stockVariantesTotal = variantes.stream()
                .mapToInt(v -> v.getStock() != null ? v.getStock() : 0)
                .sum();
            int stockDisponible = stockGlobal - stockVariantesTotal;
            
            return new StockInfoResponse(stockGlobal, stockVariantesTotal, stockDisponible);
        } catch (Exception e) {
            // En cas d'erreur, retourner des valeurs par défaut
            return new StockInfoResponse(0, 0, 0);
        }
    }
    
    private Product verifierPermissionsProduit(UUID vendorUserId, String produitId) {
        // Vérifier l'utilisateur
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!user.getRole().equals(Role.VENDOR)) {
            throw new RuntimeException("Seuls les vendeurs peuvent gérer les variantes");
        }

        // Récupérer le produit
        Product product = productRepository.findById(UUID.fromString(produitId))
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Vérifier que le vendeur possède ce produit
        if (!product.getShop().getVendor().getUser().getId().equals(vendorUserId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à gérer les variantes de ce produit");
        }

        return product;
    }
    
    private void mapRequestToEntity(VarianteRequest request, ProduitVariante variante) {
        if (request.getCouleur() != null) variante.setCouleur(request.getCouleur());
        if (request.getTaille() != null) variante.setTaille(request.getTaille());
        if (request.getModele() != null) variante.setModele(request.getModele());
        if (request.getPoids() != null) variante.setPoids(request.getPoids());
        if (request.getDimensions() != null) variante.setDimensions(request.getDimensions());
        if (request.getMateriau() != null) variante.setMateriau(request.getMateriau());
        if (request.getFinition() != null) variante.setFinition(request.getFinition());
        if (request.getCapacite() != null) variante.setCapacite(request.getCapacite());
        if (request.getPuissance() != null) variante.setPuissance(request.getPuissance());
        if (request.getParfum() != null) variante.setParfum(request.getParfum());
        if (request.getAgeCible() != null) variante.setAgeCible(request.getAgeCible());
        if (request.getGenre() != null) variante.setGenre(request.getGenre());
        if (request.getSaison() != null) variante.setSaison(request.getSaison());
        if (request.getPrixAjustement() != null) variante.setPrixAjustement(request.getPrixAjustement().doubleValue());
        if (request.getStock() != null) variante.setStock(request.getStock());
        if (request.getSku() != null) variante.setSku(request.getSku());
    }
    
    private VarianteResponse mapEntityToResponse(ProduitVariante variante) {
        VarianteResponse response = new VarianteResponse();
        response.setId(variante.getId());
        response.setProduitId(variante.getProduit().getId().toString());
        response.setCouleur(variante.getCouleur());
        response.setTaille(variante.getTaille());
        response.setModele(variante.getModele());
        response.setPoids(variante.getPoids());
        response.setDimensions(variante.getDimensions());
        response.setMateriau(variante.getMateriau());
        response.setFinition(variante.getFinition());
        response.setCapacite(variante.getCapacite());
        response.setPuissance(variante.getPuissance());
        response.setParfum(variante.getParfum());
        response.setAgeCible(variante.getAgeCible());
        response.setGenre(variante.getGenre());
        response.setSaison(variante.getSaison());
        response.setPrixAjustement(java.math.BigDecimal.valueOf(variante.getPrixAjustement()));
        response.setStock(variante.getStock());
        response.setSku(variante.getSku());
        response.setCreatedAt(variante.getCreatedAt());
        response.setUpdatedAt(variante.getUpdatedAt());
        return response;
    }
    
    private String genererSKUNouveauFormat(Product product, ProduitVariante variante) {
        String produitPrefix = product.getId().toString().substring(0, 8).toUpperCase();
        String couleurPrefix = variante.getCouleur() != null && variante.getCouleur().length() >= 2 ? 
            variante.getCouleur().substring(0, 2).toUpperCase() : "XX";
        String taillePrefix = variante.getTaille() != null ? variante.getTaille().toUpperCase() : 
                             variante.getCapacite() != null ? variante.getCapacite().substring(0, Math.min(2, variante.getCapacite().length())).toUpperCase() : "XX";
        
        // Ajouter timestamp pour éviter les doublons
        long timestamp = System.currentTimeMillis();
        return produitPrefix + "-" + couleurPrefix + "-" + taillePrefix + "-" + timestamp;
    }
    
    public List<ProduitVariante> findByProduct(Product product) {
        try {
            return produitVarianteRepository.findByProduit(product);
        } catch (Exception e) {
            return new java.util.ArrayList<>();
        }
    }
    
    public ProduitVariante save(ProduitVariante variante) {
        try {
            return produitVarianteRepository.save(variante);
        } catch (Exception e) {
            return variante;
        }
    }
}