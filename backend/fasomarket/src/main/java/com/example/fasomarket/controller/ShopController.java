package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.ShopService;
import com.example.fasomarket.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/boutiques")
@Tag(name = "Boutiques", description = "Gestion des boutiques")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @Autowired
    private FileService fileService;

    @PostMapping("/creer")
    @Operation(summary = "Créer une boutique", description = "Permet à un vendeur approuvé de créer sa boutique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Boutique créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides ou vendeur non autorisé"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> creerBoutique(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @Valid @RequestBody CreerBoutiqueRequest request) {
        try {
            BoutiqueResponse response = shopService.creerBoutique(vendorUserId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/ma-boutique")
    @Operation(summary = "Ma boutique", description = "Récupère la boutique du vendeur connecté")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Boutique récupérée"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "404", description = "Aucune boutique trouvée")
    })
    public ResponseEntity<?> obtenirMaBoutique(@RequestHeader("X-User-Id") UUID vendorUserId) {
        try {
            BoutiqueResponse boutique = shopService.obtenirBoutiqueVendeur(vendorUserId);
            return ResponseEntity.ok(boutique);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/actives")
    @Operation(summary = "Boutiques actives", description = "Récupère toutes les boutiques actives")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des boutiques actives")
    })
    public ResponseEntity<List<BoutiqueResponse>> obtenirBoutiquesActives() {
        List<BoutiqueResponse> boutiques = shopService.obtenirBoutiquesActives();
        return ResponseEntity.ok(boutiques);
    }

    @PutMapping("/{boutiqueId}")
    @Operation(summary = "Modifier une boutique", description = "Modifie les informations d'une boutique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Boutique modifiée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides ou non autorisé"),
            @ApiResponse(responseCode = "404", description = "Boutique non trouvée")
    })
    public ResponseEntity<?> modifierBoutique(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID boutiqueId,
            @Valid @RequestBody ModifierBoutiqueRequest request) {
        try {
            BoutiqueResponse response = shopService.modifierBoutique(vendorUserId, boutiqueId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{boutiqueId}")
    @Operation(summary = "Supprimer une boutique", description = "Supprime une boutique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Boutique supprimée avec succès"),
            @ApiResponse(responseCode = "400", description = "Non autorisé"),
            @ApiResponse(responseCode = "404", description = "Boutique non trouvée")
    })
    public ResponseEntity<?> supprimerBoutique(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID boutiqueId) {
        try {
            shopService.supprimerBoutique(vendorUserId, boutiqueId);
            return ResponseEntity.ok("Boutique supprimée avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/rechercher")
    @Operation(summary = "Rechercher des boutiques", description = "Recherche des boutiques par nom et/ou catégorie")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Résultats de recherche")
    })
    public ResponseEntity<List<BoutiqueResponse>> rechercherBoutiques(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String categorie) {
        List<BoutiqueResponse> boutiques = shopService.rechercherBoutiques(nom, categorie);
        return ResponseEntity.ok(boutiques);
    }

    @GetMapping("/{boutiqueId}")
    @Operation(summary = "Détails d'une boutique", description = "Récupère les détails d'une boutique par son ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Détails de la boutique"),
            @ApiResponse(responseCode = "404", description = "Boutique non trouvée")
    })
    public ResponseEntity<?> obtenirBoutique(@PathVariable UUID boutiqueId) {
        try {
            BoutiqueResponse boutique = shopService.obtenirBoutique(boutiqueId);
            return ResponseEntity.ok(boutique);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{boutiqueId}/logo")
    @Operation(summary = "Upload logo boutique", description = "Upload du logo d'une boutique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logo uploadé avec succès"),
            @ApiResponse(responseCode = "400", description = "Erreur upload ou non autorisé"),
            @ApiResponse(responseCode = "404", description = "Boutique non trouvée")
    })
    public ResponseEntity<?> uploadLogo(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID boutiqueId,
            @RequestParam("logo") MultipartFile file) {
        try {
            String logoUrl = shopService.uploadLogo(vendorUserId, boutiqueId, file);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logoUrl", logoUrl);
            response.put("message", "Logo uploadé avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{boutiqueId}/banner")
    @Operation(summary = "Upload banner boutique", description = "Upload de la bannière d'une boutique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bannière uploadée avec succès"),
            @ApiResponse(responseCode = "400", description = "Erreur upload ou non autorisé"),
            @ApiResponse(responseCode = "404", description = "Boutique non trouvée")
    })
    public ResponseEntity<?> uploadBanner(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID boutiqueId,
            @RequestParam("banner") MultipartFile file) {
        try {
            String bannerUrl = shopService.uploadBanner(vendorUserId, boutiqueId, file);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bannerUrl", bannerUrl);
            response.put("message", "Bannière uploadée avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}