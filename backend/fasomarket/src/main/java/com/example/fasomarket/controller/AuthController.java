package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "API d'authentification multi-rôles")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/connexion")
    @Operation(summary = "Connexion utilisateur", description = "Connecte un utilisateur (client, vendeur ou admin)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Connexion réussie"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Identifiants incorrects")
    })
    public ResponseEntity<?> connexion(@Valid @RequestBody ConnexionRequest request) {
        try {
            AuthResponse response = authService.connexion(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/inscription-client")
    @Operation(summary = "Inscription client", description = "Inscrit un nouveau client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Inscription réussie"),
        @ApiResponse(responseCode = "400", description = "Données invalides ou utilisateur existant")
    })
    public ResponseEntity<?> inscriptionClient(@Valid @RequestBody InscriptionClientRequest request) {
        try {
            AuthResponse response = authService.inscriptionClient(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/inscription-vendeur")
    @Operation(summary = "Inscription vendeur", description = "Inscrit un nouveau vendeur (en attente de validation)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Inscription réussie"),
        @ApiResponse(responseCode = "400", description = "Données invalides ou utilisateur existant")
    })
    public ResponseEntity<?> inscriptionVendeur(@Valid @RequestBody InscriptionVendeurRequest request) {
        try {
            AuthResponse response = authService.inscriptionVendeur(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/profil")
    @Operation(summary = "Obtenir le profil", description = "Récupère les informations du profil utilisateur connecté")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<String> obtenirProfil() {
        return ResponseEntity.ok("Endpoint pour obtenir le profil - À implémenter avec JWT");
    }

    @PutMapping("/changer-mot-de-passe")
    @Operation(summary = "Changer mot de passe", description = "Permet à l'utilisateur de changer son mot de passe")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mot de passe changé"),
        @ApiResponse(responseCode = "400", description = "Ancien mot de passe incorrect")
    })
    public ResponseEntity<?> changerMotDePasse(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ChangerMotDePasseRequest request) {
        try {
            authService.changerMotDePasse(userId, request);
            return ResponseEntity.ok("Mot de passe changé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}