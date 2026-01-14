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
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public CategorieResponse creerCategorie(CreerCategorieRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getNom())) {
            throw new RuntimeException("Cette catégorie existe déjà");
        }

        Category category = new Category(request.getNom(), request.getDescription());
        category.setIcon(request.getIcone());
        category = categoryRepository.save(category);

        return mapToResponse(category);
    }

    public List<CategorieResponse> obtenirCategories() {
        return categoryRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategorieResponse obtenirCategorie(UUID categorieId) {
        Category category = categoryRepository.findById(categorieId)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        return mapToResponse(category);
    }

    public Category obtenirOuCreerCategorie(String nomCategorie) {
        return categoryRepository.findByNameIgnoreCase(nomCategorie)
                .orElseGet(() -> {
                    Category newCategory = new Category(nomCategorie, "Catégorie créée automatiquement");
                    return categoryRepository.save(newCategory);
                });
    }

    public List<BoutiqueResponse> obtenirBoutiquesParCategorie(UUID categorieId) {
        Category category = categoryRepository.findById(categorieId)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        return shopRepository.findByStatusAndCategoryEntity(ShopStatus.ACTIVE, category)
                .stream()
                .map(this::mapShopToResponse)
                .collect(Collectors.toList());
    }

    public List<ProduitResponse> obtenirProduitsParCategorie(UUID categorieId) {
        Category category = categoryRepository.findById(categorieId)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        return productRepository.findByIsActiveTrueAndCategoryEntity(category)
                .stream()
                .map(this::mapProductToResponse)
                .collect(Collectors.toList());
    }

    private CategorieResponse mapToResponse(Category category) {
        CategorieResponse response = new CategorieResponse();
        response.setId(category.getId());
        response.setNom(category.getName());
        response.setDescription(category.getDescription());
        response.setIcone(category.getIcon());
        response.setActive(category.getIsActive());
        response.setDateCreation(category.getCreatedAt());
        
        // Compter les boutiques et produits
        long nombreBoutiques = shopRepository.findByStatusAndCategoryEntity(ShopStatus.ACTIVE, category).size();
        long nombreProduits = productRepository.findByIsActiveTrueAndCategoryEntity(category).size();
        
        response.setNombreBoutiques(nombreBoutiques);
        response.setNombreProduits(nombreProduits);
        
        return response;
    }

    private BoutiqueResponse mapShopToResponse(Shop shop) {
        BoutiqueResponse response = new BoutiqueResponse();
        response.setId(shop.getId());
        response.setNom(shop.getName());
        response.setDescription(shop.getDescription());
        response.setCategorie(shop.getCategoryEntity() != null ? shop.getCategoryEntity().getName() : shop.getCategory());
        return response;
    }

    private ProduitResponse mapProductToResponse(Product product) {
        ProduitResponse response = new ProduitResponse();
        response.setId(product.getId());
        response.setNom(product.getName());
        response.setDescription(product.getDescription());
        response.setCategorie(product.getCategoryEntity() != null ? product.getCategoryEntity().getName() : product.getCategory());
        response.setPrix(product.getPrice());
        return response;
    }
}