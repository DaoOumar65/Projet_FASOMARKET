package com.example.fasomarket.service;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.*;
import com.example.fasomarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
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

    @Transactional
    public ProduitResponse creerProduit(UUID vendorUserId, CreerProduitRequest request) {
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

        Product product = new Product(shop, request.getNom(), request.getDescription(),
                request.getCategorieId(), request.getPrix(), request.getStock());

        // Gérer la catégorie par ID
        if (request.getCategorieId() != null && !request.getCategorieId().trim().isEmpty()) {
            try {
                UUID categoryId = UUID.fromString(request.getCategorieId());
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
                product.setCategoryEntity(category);
                product.setCategory(category.getNom());
            } catch (Exception e) {
                throw new RuntimeException("Catégorie invalide");
            }
        }

        // Informations de base
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            product.setImages(String.join(",", request.getImages()));
        }

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            product.setTags(String.join(",", request.getTags()));
        }

        product.setWeight(request.getPoids());
        product.setDimensions(request.getDimensions());
        product.setColor(request.getCouleur());
        product.setBrand(request.getMarque());
        product.setMaterial(request.getMateriau());
        product.setSize(request.getTaille());

        // Informations commerciales
        product.setDiscount(request.getRemise());
        product.setMinOrderQuantity(request.getQuantiteMinCommande());
        product.setMaxOrderQuantity(request.getQuantiteMaxCommande());
        product.setWarrantyPeriod(request.getPeriodeGarantie());
        product.setReturnPolicy(request.getPolitiqueRetour());

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
}