package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.ProductService;
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
@RequestMapping("/api/produits")
@Tag(name = "Produits", description = "Gestion des produits")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/creer")
    @Operation(summary = "Créer un produit", description = "Permet à un vendeur d'ajouter un produit à sa boutique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Produit créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides ou non autorisé"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> creerProduit(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @Valid @RequestBody CreerProduitRequest request) {
        try {
            ProduitResponse response = productService.creerProduit(vendorUserId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/boutique/{boutiqueId}")
    @Operation(summary = "Produits d'une boutique", description = "Récupère tous les produits actifs d'une boutique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des produits de la boutique")
    })
    public ResponseEntity<List<ProduitResponse>> obtenirProduitsBoutique(@PathVariable UUID boutiqueId) {
        List<ProduitResponse> produits = productService.obtenirProduitsBoutique(boutiqueId);
        return ResponseEntity.ok(produits);
    }

    @GetMapping("/mes-produits")
    @Operation(summary = "Mes produits", description = "Récupère les produits du vendeur connecté")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des produits du vendeur"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> obtenirMesProduits(@RequestHeader("X-User-Id") UUID vendorUserId) {
        try {
            List<ProduitResponse> produits = productService.obtenirMesProduits(vendorUserId);
            return ResponseEntity.ok(produits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/actifs")
    @Operation(summary = "Produits actifs", description = "Récupère tous les produits actifs et disponibles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des produits actifs")
    })
    public ResponseEntity<List<ProduitResponse>> obtenirProduitsActifs() {
        List<ProduitResponse> produits = productService.obtenirProduitsActifs();
        return ResponseEntity.ok(produits);
    }

    @GetMapping("/{produitId}")
    @Operation(summary = "Détails d'un produit", description = "Récupère les détails d'un produit par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Détails du produit"),
        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    })
    public ResponseEntity<?> obtenirProduit(@PathVariable UUID produitId) {
        try {
            ProduitResponse produit = productService.obtenirProduit(produitId);
            return ResponseEntity.ok(produit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{produitId}")
    @Operation(summary = "Modifier un produit", description = "Modifie les informations d'un produit")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Produit modifié avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides ou non autorisé"),
        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    })
    public ResponseEntity<?> modifierProduit(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID produitId,
            @Valid @RequestBody ModifierProduitRequest request) {
        try {
            ProduitResponse response = productService.modifierProduit(vendorUserId, produitId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{produitId}")
    @Operation(summary = "Supprimer un produit", description = "Supprime un produit")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Produit supprimé avec succès"),
        @ApiResponse(responseCode = "400", description = "Non autorisé"),
        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    })
    public ResponseEntity<?> supprimerProduit(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID produitId) {
        try {
            productService.supprimerProduit(vendorUserId, produitId);
            return ResponseEntity.ok("Produit supprimé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rechercher")
    @Operation(summary = "Rechercher des produits", description = "Recherche des produits par nom et/ou catégorie")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Résultats de recherche")
    })
    public ResponseEntity<List<ProduitResponse>> rechercherProduits(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String categorie) {
        List<ProduitResponse> produits = productService.rechercherProduits(nom, categorie);
        return ResponseEntity.ok(produits);
    }

    @PutMapping("/{produitId}/stock")
    @Operation(summary = "Réapprovisionner stock", description = "Ajoute du stock à un produit")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock mis à jour avec succès"),
        @ApiResponse(responseCode = "400", description = "Non autorisé ou données invalides")
    })
    public ResponseEntity<?> reapprovisionnerStock(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID produitId,
            @RequestParam int quantite) {
        try {
            productService.reapprovisionnerStock(vendorUserId, produitId, quantite);
            return ResponseEntity.ok("Stock mis à jour avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}