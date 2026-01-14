package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/panier")
@Tag(name = "Panier", description = "Gestion du panier d'achat")
public class PanierController {

    @Autowired
    private CartService cartService;

    @PostMapping("/ajouter")
    @Operation(summary = "Ajouter un produit au panier")
    public ResponseEntity<?> ajouterAuPanier(
            @RequestHeader("X-User-Id") UUID clientId,
            @Valid @RequestBody AjouterPanierRequest request) {
        try {
            PanierItemResponse response = cartService.ajouterAuPanier(clientId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Voir le contenu du panier")
    public ResponseEntity<?> obtenirPanier(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            return ResponseEntity.ok(cartService.obtenirPanier(clientId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Supprimer un article du panier")
    public ResponseEntity<?> supprimerDuPanier(
            @RequestHeader("X-User-Id") UUID clientId,
            @PathVariable UUID itemId) {
        try {
            cartService.supprimerDuPanier(clientId, itemId);
            return ResponseEntity.ok("Article supprimé");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/vider")
    @Operation(summary = "Vider le panier")
    public ResponseEntity<?> viderPanier(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            cartService.viderPanier(clientId);
            return ResponseEntity.ok("Panier vidé");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}