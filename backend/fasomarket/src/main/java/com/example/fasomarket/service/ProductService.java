package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockService stockService;

    @Transactional
    public ProduitResponse creerProduit(UUID vendorUserId, CreerProduitRequest request) {
        try {
            // Validation
            if (request.getNom() == null || request.getNom().trim().isEmpty()) {
                throw new RuntimeException("Le nom du produit est requis");
            }
            if (request.getPrix() == null || request.getPrix().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Le prix doit être supérieur à 0");
            }
            if (request.getStock() == null || request.getStock() < 0) {
                throw new RuntimeException("Le stock doit être >= 0");
            }

            // Vérifier que l'utilisateur est un vendeur
            User user = userRepository.findById(vendorUserId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!user.getRole().equals(Role.VENDOR)) {
                throw new RuntimeException("Seuls les vendeurs peuvent créer des produits");
            }

            Vendor vendor = vendorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Profil vendeur non trouvé"));

            // Prendre la première boutique active du vendeur
            List<Shop> shops = shopRepository.findByVendor(vendor);
            Shop shop = shops.stream()
                    .filter(s -> s.getStatus().equals(ShopStatus.ACTIVE))
                    .findFirst()
                    .orElseThrow(
                            () -> new RuntimeException("Vous devez avoir une boutique active pour créer des produits"));

            // Gérer la catégorie par ID d'abord
            String categoryName = null;
            if (request.getCategorieId() != null && !request.getCategorieId().trim().isEmpty()) {
                try {
                    UUID categoryId = UUID.fromString(request.getCategorieId());
                    Category category = categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
                    categoryName = category.getNom();
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Format de catégorie invalide: " + request.getCategorieId());
                } catch (Exception e) {
                    throw new RuntimeException("Erreur catégorie: " + e.getMessage());
                }
            }

            Product product = new Product(shop, request.getNom(), request.getDescription(),
                    categoryName, request.getPrix(), request.getStock());

            // Lier l'entité catégorie
            if (categoryName != null) {
                try {
                    UUID categoryId = UUID.fromString(request.getCategorieId());
                    Category category = categoryRepository.findById(categoryId).orElse(null);
                    product.setCategoryEntity(category);
                } catch (Exception e) {
                    // Ignorer si déjà géré
                }
            }

            // Informations de base
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                if (request.getImages().size() > 10) {
                    throw new RuntimeException("Maximum 10 images par produit");
                }
                product.setImages(String.join(",", request.getImages()));
            }

            if (request.getTags() != null && !request.getTags().isEmpty()) {
                product.setTags(String.join(",", request.getTags()));
            }

            product.setWeight(request.getPoids());
            product.setDimensions(request.getDimensions());
            product.setColor(request.getCouleur());
            product.setBrand(request.getMarque() != null && !request.getMarque().isEmpty() ? request.getMarque() : null);
            product.setMaterial(request.getMateriau() != null && !request.getMateriau().isEmpty() ? request.getMateriau() : null);
            product.setSize(request.getTaille() != null && !request.getTaille().isEmpty() ? request.getTaille() : null);
            product.setSizes(request.getSizes() != null && !request.getSizes().isEmpty() && !request.getSizes().equals("[]") ? request.getSizes() : null);
            product.setColors(request.getColors() != null && !request.getColors().isEmpty() && !request.getColors().equals("[]") ? request.getColors() : null);
            product.setOrigin(request.getOrigine() != null && !request.getOrigine().isEmpty() ? request.getOrigine() : null);

            // Informations commerciales
            product.setDiscount(request.getRemise());
            product.setMinOrderQuantity(request.getQuantiteMinCommande());
            product.setMaxOrderQuantity(request.getQuantiteMaxCommande());
            product.setWarrantyPeriod(request.getPeriodeGarantie() != null && !request.getPeriodeGarantie().isEmpty() ? request.getPeriodeGarantie() : null);
            product.setReturnPolicy(request.getPolitiqueRetour() != null && !request.getPolitiqueRetour().isEmpty() ? request.getPolitiqueRetour() : null);

            // Informations logistiques
            product.setShippingWeight(request.getPoidsExpedition());
            product.setShippingDimensions(request.getDimensionsExpedition());

            // SEO
            product.setMetaTitle(request.getMetaTitre());
            product.setMetaDescription(request.getMetaDescription());
            product.setMetaKeywords(request.getMetaMotsCles());

            // Statut
            product.setFeatured(request.getEnVedette());
            product.setIsActive(request.getActif());

            product = productRepository.save(product);
            return mapToResponse(product);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erreur création produit: " + e.getMessage(), e);
        }
    }

    public List<ProduitResponse> obtenirProduitsBoutique(UUID boutiqueId) {
        Shop shop = shopRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        return productRepository.findByShopAndIsActiveTrue(shop)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProduitResponse> obtenirMesProduits(UUID vendorUserId) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Vendor vendor = vendorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profil vendeur non trouvé"));

        List<Shop> shops = shopRepository.findByVendor(vendor);
        return shops.stream()
                .flatMap(shop -> productRepository.findByShop(shop).stream())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProduitResponse> obtenirProduitsActifs() {
        return productRepository.findByIsActiveTrueAndAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProduitResponse obtenirProduit(UUID produitId) {
        Product product = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        return mapToResponse(product);
    }

    public ProduitResponse obtenirProduit(UUID vendorUserId, UUID produitId) {
        Product product = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        verifierProprietaireBoutique(vendorUserId, product.getShop().getId());
        return mapToResponse(product);
    }

    @Transactional
    public ProduitResponse modifierProduit(UUID vendorUserId, UUID produitId, ModifierProduitRequest request) {
        Product product = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        verifierProprietaireBoutique(vendorUserId, product.getShop().getId());

        if (request.getSku() != null && !request.getSku().equals(product.getSku()) &&
                productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Ce SKU est déjà utilisé");
        }

        if (request.getNom() != null)
            product.setName(request.getNom());
        if (request.getDescription() != null)
            product.setDescription(request.getDescription());
        if (request.getCategorie() != null)
            product.setCategory(request.getCategorie());
        if (request.getPrix() != null)
            product.setPrice(request.getPrix());
        if (request.getQuantiteStock() != null)
            product.setStockQuantity(request.getQuantiteStock());
        if (request.getImages() != null)
            product.setImages(request.getImages());
        if (request.getSku() != null)
            product.setSku(request.getSku());
        if (request.getPoids() != null)
            product.setWeight(request.getPoids());
        if (request.getDimensions() != null)
            product.setDimensions(request.getDimensions());
        if (request.getTags() != null)
            product.setTags(request.getTags());
        if (request.getRemise() != null)
            product.setDiscount(request.getRemise());
        if (request.getActif() != null)
            product.setIsActive(request.getActif());
        if (request.getStatus() != null) {
            try {
                ProductStatus status = ProductStatus.valueOf(request.getStatus().toUpperCase());
                product.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Statut invalide: " + request.getStatus());
            }
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public void supprimerProduit(UUID vendorUserId, UUID produitId) {
        Product product = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        verifierProprietaireBoutique(vendorUserId, product.getShop().getId());
        productRepository.delete(product);
    }

    public List<ProduitResponse> rechercherProduits(String nom, String categorie) {
        if (nom != null && categorie != null) {
            return productRepository
                    .findByIsActiveTrueAndNameContainingIgnoreCaseAndCategoryContainingIgnoreCase(nom, categorie)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else if (nom != null) {
            return productRepository.findByIsActiveTrueAndNameContainingIgnoreCase(nom)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else if (categorie != null) {
            return productRepository.findByIsActiveTrueAndCategoryContainingIgnoreCase(categorie)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            return obtenirProduitsActifs();
        }
    }

    private Shop verifierProprietaireBoutique(UUID vendorUserId, UUID boutiqueId) {
        User user = userRepository.findById(vendorUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!user.getRole().equals(Role.VENDOR)) {
            throw new RuntimeException("Seuls les vendeurs peuvent gérer les produits");
        }

        Shop shop = shopRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        if (!shop.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à gérer les produits de cette boutique");
        }

        return shop;
    }

    private ProduitResponse mapToResponse(Product product) {
        ProduitResponse response = new ProduitResponse();
        response.setId(product.getId());
        response.setBoutiqueId(product.getShop().getId());
        response.setNomBoutique(product.getShop().getName());
        response.setNom(product.getName());
        response.setDescription(product.getDescription());
        response.setCategorie(product.getCategory());
        response.setPrix(product.getPrice());
        response.setQuantiteStock(product.getStockQuantity());
        response.setActif(product.getIsActive());
        response.setImages(product.getImages());
        
        // Ajouter l'objet catégorie complet
        if (product.getCategoryEntity() != null) {
            java.util.Map<String, Object> catObj = new java.util.HashMap<>();
            catObj.put("id", product.getCategoryEntity().getId());
            catObj.put("nom", product.getCategoryEntity().getNom());
            catObj.put("description", product.getCategoryEntity().getDescription());
            response.setCategorieObj(catObj);
        }
        
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            response.setImagesList(Arrays.asList(product.getImages().split(",")));
        } else {
            response.setImagesList(new ArrayList<>());
        }
        response.setSku(product.getSku());
        response.setPoids(product.getWeight());
        response.setDimensions(product.getDimensions());
        response.setTags(product.getTags());
        response.setRemise(product.getDiscount());
        response.setNote(product.getRating());
        response.setNombreAvis(product.getReviewsCount());
        response.setDisponible(product.getAvailable());
        response.setDateCreation(product.getCreatedAt());
        response.setDateModification(product.getUpdatedAt());
        
        // Détails produits
        response.setSizes(product.getSizes());
        response.setColors(product.getColors());
        response.setCouleur(product.getColor());
        response.setTaille(product.getSize());
        response.setMarque(product.getBrand());
        response.setMateriau(product.getMaterial());
        response.setOrigine(product.getOrigin());
        response.setPeriodeGarantie(product.getWarrantyPeriod());
        response.setPolitiqueRetour(product.getReturnPolicy());
        
        return response;
    }

    // Méthodes manquantes pour les statistiques
    public long compterProduitsActifs() {
        return productRepository.countByIsActiveTrue();
    }

    public long compterProduitsParBoutique(UUID boutiqueId) {
        Shop shop = shopRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));
        return productRepository.countByShop(shop);
    }

    @Transactional
    public void reapprovisionnerStock(UUID vendorUserId, UUID produitId, int quantite) {
        if (quantite <= 0) {
            throw new RuntimeException("La quantité doit être positive");
        }

        Product product = productRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        verifierProprietaireBoutique(vendorUserId, product.getShop().getId());

        // Utiliser StockService pour incrémenter le stock
        stockService.incrementStock(product, quantite);

        // Réactiver le produit s'il était désactivé pour rupture de stock
        if (!product.getAvailable() && product.getStockQuantity() > 0) {
            product.setAvailable(true);
            productRepository.save(product);
        }
    }
}