package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.model.OrderStatus;
import com.example.fasomarket.service.OrderService;
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
@RequestMapping("/api/commandes")
@Tag(name = "Commandes", description = "Gestion des commandes")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/creer")
    @Operation(summary = "Créer une commande", description = "Valide le panier et crée une commande")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Commande créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Panier vide ou produits non disponibles"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> creerCommande(
            @RequestHeader("X-User-Id") UUID clientId,
            @Valid @RequestBody CreerCommandeRequest request) {
        try {
            CommandeResponse response = orderService.creerCommande(clientId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/mes-commandes")
    @Operation(summary = "Mes commandes", description = "Récupère les commandes du client connecté")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des commandes du client"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> obtenirMesCommandes(@RequestHeader("X-User-Id") UUID clientId) {
        try {
            List<CommandeResponse> commandes = orderService.obtenirMesCommandes(clientId);
            return ResponseEntity.ok(commandes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/client/historique-commandes")
    @Operation(summary = "Historique commandes client", description = "Alias pour /mes-commandes")
    public ResponseEntity<?> obtenirHistoriqueCommandes(@RequestHeader("X-User-Id") UUID clientId) {
        return obtenirMesCommandes(clientId);
    }

    @GetMapping("/{commandeId}")
    @Operation(summary = "Détails d'une commande", description = "Récupère les détails d'une commande")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Détails de la commande"),
        @ApiResponse(responseCode = "404", description = "Commande non trouvée"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    public ResponseEntity<?> obtenirCommande(
            @RequestHeader("X-User-Id") UUID clientId,
            @PathVariable UUID commandeId) {
        try {
            CommandeResponse commande = orderService.obtenirCommande(clientId, commandeId);
            return ResponseEntity.ok(commande);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vendeur/mes-commandes")
    @Operation(summary = "Mes commandes vendeur", description = "Récupère les commandes contenant les produits du vendeur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des commandes du vendeur"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> obtenirCommandesVendeur(@RequestHeader("X-User-Id") UUID vendorUserId) {
        try {
            List<CommandeResponse> commandes = orderService.obtenirCommandesVendeur(vendorUserId);
            return ResponseEntity.ok(commandes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vendeur/par-statut")
    @Operation(summary = "Commandes vendeur par statut", description = "Récupère les commandes du vendeur filtrées par statut")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des commandes filtrées"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> obtenirCommandesVendeurParStatut(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @RequestParam OrderStatus statut) {
        try {
            List<CommandeResponse> commandes = orderService.obtenirCommandesVendeurParStatut(vendorUserId, statut);
            return ResponseEntity.ok(commandes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/vendeur/{commandeId}/statut")
    @Operation(summary = "Changer statut (vendeur)", description = "Change le statut d'une commande (vendeur autorisé)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statut mis à jour"),
        @ApiResponse(responseCode = "400", description = "Transition non autorisée"),
        @ApiResponse(responseCode = "404", description = "Commande non trouvée")
    })
    public ResponseEntity<?> changerStatutCommandeVendeur(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable UUID commandeId,
            @RequestParam OrderStatus statut) {
        try {
            CommandeResponse response = orderService.changerStatutCommandeVendeur(vendorUserId, commandeId, statut);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{commandeId}/statut")
    @Operation(summary = "Changer le statut (admin)", description = "Change le statut d'une commande (admin uniquement)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statut mis à jour"),
        @ApiResponse(responseCode = "404", description = "Commande non trouvée")
    })
    public ResponseEntity<?> changerStatutCommande(
            @PathVariable UUID commandeId,
            @RequestParam OrderStatus statut) {
        try {
            CommandeResponse response = orderService.changerStatutCommande(commandeId, statut);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}