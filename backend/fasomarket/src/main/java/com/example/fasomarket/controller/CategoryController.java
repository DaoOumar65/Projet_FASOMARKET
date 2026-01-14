package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Catégories", description = "Gestion des catégories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/creer")
    @Operation(summary = "Créer une catégorie", description = "Crée une nouvelle catégorie")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Catégorie créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Catégorie déjà existante")
    })
    public ResponseEntity<?> creerCategorie(@Valid @RequestBody CreerCategorieRequest request) {
        try {
            CategorieResponse response = categoryService.creerCategorie(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Lister les catégories", description = "Récupère toutes les catégories actives")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des catégories")
    })
    public ResponseEntity<List<CategorieResponse>> obtenirCategories() {
        List<CategorieResponse> categories = categoryService.obtenirCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{categorieId}")
    @Operation(summary = "Détails d'une catégorie", description = "Récupère les détails d'une catégorie")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Détails de la catégorie"),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée")
    })
    public ResponseEntity<?> obtenirCategorie(@PathVariable UUID categorieId) {
        try {
            CategorieResponse categorie = categoryService.obtenirCategorie(categorieId);
            return ResponseEntity.ok(categorie);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{categorieId}/boutiques")
    @Operation(summary = "Boutiques par catégorie", description = "Récupère les boutiques d'une catégorie")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des boutiques de la catégorie")
    })
    public ResponseEntity<?> obtenirBoutiquesParCategorie(@PathVariable UUID categorieId) {
        try {
            List<BoutiqueResponse> boutiques = categoryService.obtenirBoutiquesParCategorie(categorieId);
            return ResponseEntity.ok(boutiques);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{categorieId}/produits")
    @Operation(summary = "Produits par catégorie", description = "Récupère les produits d'une catégorie")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des produits de la catégorie")
    })
    public ResponseEntity<?> obtenirProduitsParCategorie(@PathVariable UUID categorieId) {
        try {
            List<ProduitResponse> produits = categoryService.obtenirProduitsParCategorie(categorieId);
            return ResponseEntity.ok(produits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}