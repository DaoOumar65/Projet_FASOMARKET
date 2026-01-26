package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.CartService;
import com.example.fasomarket.model.ProduitVariante;
import com.example.fasomarket.repository.ProduitVarianteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/panier")
@Tag(name = "Panier", description = "Gestion du panier d'achat")
public class PanierController {

    @Autowired
    private CartService cartService;

    @Autowired
    private ProduitVarianteRepository produitVarianteRepository;

    @PostMapping("/ajouter")
    @Operation(summary = "Ajouter un produit au panier")
    public ResponseEntity<?> ajouterAuPanier(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestBody Map<String, Object> request) {
        try {
            UUID clientId = UUID.fromString(userIdStr);
            UUID produitId = UUID.fromString(request.get("produitId").toString());
            Integer quantite = Integer.valueOf(request.get("quantite").toString());
            Long varianteId = request.get("varianteId") != null ? Long.valueOf(request.get("varianteId").toString()) : null;
            
            // Créer la requête avec variante
            AjouterPanierRequest panierRequest = new AjouterPanierRequest();
            panierRequest.setProduitId(produitId);
            panierRequest.setQuantite(quantite);
            
            // Si une variante est spécifiée, récupérer ses détails
            if (varianteId != null) {
                ProduitVariante variante = produitVarianteRepository.findById(varianteId)
                    .orElseThrow(() -> new RuntimeException("Variante non trouvée"));
                panierRequest.setCouleurSelectionnee(variante.getCouleur());
                panierRequest.setTailleSelectionnee(variante.getTaille());
                panierRequest.setModeleSelectionne(variante.getModele());
            }
            
            PanierItemResponse response = cartService.ajouterAuPanier(clientId, panierRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Données invalides");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Voir le contenu du panier")
    public ResponseEntity<?> obtenirPanier(@RequestHeader("X-User-Id") String userIdStr) {
        try {
            UUID clientId = UUID.fromString(userIdStr);
            return ResponseEntity.ok(cartService.obtenirPanier(clientId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("ID utilisateur invalide");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Supprimer un article du panier")
    public ResponseEntity<?> supprimerDuPanier(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable UUID itemId) {
        try {
            UUID clientId = UUID.fromString(userIdStr);
            cartService.supprimerDuPanier(clientId, itemId);
            return ResponseEntity.ok("Article supprimé");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("ID utilisateur invalide");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/vider")
    @Operation(summary = "Vider le panier")
    public ResponseEntity<?> viderPanier(@RequestHeader("X-User-Id") String userIdStr) {
        try {
            UUID clientId = UUID.fromString(userIdStr);
            cartService.viderPanier(clientId);
            return ResponseEntity.ok("Panier vidé");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("ID utilisateur invalide");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}