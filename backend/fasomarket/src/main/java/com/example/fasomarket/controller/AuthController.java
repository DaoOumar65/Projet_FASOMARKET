package com.example.fasomarket.controller;

import com.example.fasomarket.dto.AuthResponse;
import com.example.fasomarket.dto.ChangerMotDePasseRequest;
import com.example.fasomarket.dto.ConnexionRequest;
import com.example.fasomarket.dto.InscriptionClientRequest;
import com.example.fasomarket.dto.InscriptionVendeurRequest;
import com.example.fasomarket.model.User;
import com.example.fasomarket.repository.UserRepository;
import com.example.fasomarket.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "API d'authentification multi-roles")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/connexion")
    @Operation(summary = "Connexion utilisateur", description = "Connecte un utilisateur (client, vendeur ou admin)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Connexion reussie"),
            @ApiResponse(responseCode = "400", description = "Donnees invalides"),
            @ApiResponse(responseCode = "401", description = "Identifiants incorrects")
    })
    public ResponseEntity<?> connexion(@Valid @RequestBody ConnexionRequest request) {
        try {
            AuthResponse response = authService.connexion(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", "AUTH_LOGIN_ERROR",
                    "message", e.getMessage()));
        }
    }

    @PostMapping("/inscription-client")
    @Operation(summary = "Inscription client", description = "Inscrit un nouveau client")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription reussie"),
            @ApiResponse(responseCode = "400", description = "Donnees invalides ou utilisateur existant")
    })
    public ResponseEntity<?> inscriptionClient(@Valid @RequestBody InscriptionClientRequest request) {
        try {
            AuthResponse response = authService.inscriptionClient(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", "AUTH_REGISTER_CLIENT_ERROR",
                    "message", e.getMessage()));
        }
    }

    @PostMapping("/inscription-vendeur")
    @Operation(summary = "Inscription vendeur", description = "Inscrit un nouveau vendeur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription reussie"),
            @ApiResponse(responseCode = "400", description = "Donnees invalides ou utilisateur existant")
    })
    public ResponseEntity<?> inscriptionVendeur(@Valid @RequestBody InscriptionVendeurRequest request) {
        try {
            AuthResponse response = authService.inscriptionVendeur(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", "AUTH_REGISTER_VENDOR_ERROR",
                    "message", e.getMessage()));
        }
    }

    @GetMapping("/profil")
    @Operation(summary = "Obtenir le profil", description = "Recupere les informations du profil utilisateur")
    public ResponseEntity<?> obtenirProfil(@RequestHeader("X-User-Id") UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        return ResponseEntity.ok(buildProfilPayload(user));
    }

    @PutMapping("/profil")
    @Operation(summary = "Mettre a jour le profil", description = "Met a jour nom, telephone et email")
    public ResponseEntity<?> mettreAJourProfil(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, String> request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        String nomComplet = request.get("nomComplet");
        String telephone = request.get("telephone");
        String email = request.get("email");

        if (nomComplet != null && !nomComplet.isBlank()) {
            user.setFullName(nomComplet.trim());
        }

        if (telephone != null && !telephone.isBlank() && !telephone.equals(user.getPhone())) {
            String cleanPhone = telephone.trim();
            if (userRepository.existsByPhone(cleanPhone)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "code", "PHONE_ALREADY_USED",
                        "message", "Ce numero de telephone est deja utilise"));
            }
            user.setPhone(cleanPhone);
        }

        if (email != null) {
            String cleanEmail = email.trim();
            String currentEmail = user.getEmail();
            if (!cleanEmail.isEmpty() && (currentEmail == null || !cleanEmail.equalsIgnoreCase(currentEmail))) {
                if (userRepository.existsByEmail(cleanEmail)) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "code", "EMAIL_ALREADY_USED",
                            "message", "Cet email est deja utilise"));
                }
                user.setEmail(cleanEmail);
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "Profil mis a jour avec succes",
                "profil", buildProfilPayload(user)));
    }

    @PutMapping("/changer-mot-de-passe")
    @Operation(summary = "Changer mot de passe", description = "Permet a l'utilisateur de changer son mot de passe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mot de passe change"),
            @ApiResponse(responseCode = "400", description = "Ancien mot de passe incorrect")
    })
    public ResponseEntity<?> changerMotDePasse(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ChangerMotDePasseRequest request) {
        try {
            authService.changerMotDePasse(userId, request);
            return ResponseEntity.ok(Map.of("message", "Mot de passe change avec succes"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "code", "PASSWORD_CHANGE_ERROR",
                    "message", e.getMessage()));
        }
    }

    private Map<String, Object> buildProfilPayload(User user) {
        Map<String, Object> profil = new java.util.HashMap<>();
        profil.put("id", user.getId());
        profil.put("nomComplet", user.getFullName());
        profil.put("telephone", user.getPhone());
        profil.put("email", user.getEmail());
        profil.put("role", user.getRole().name());
        profil.put("estActif", user.getIsActive());
        profil.put("estVerifie", user.getIsVerified());
        profil.put("dateCreation", user.getCreatedAt());
        return profil;
    }
}
