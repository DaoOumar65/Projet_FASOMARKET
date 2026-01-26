package com.example.fasomarket.controller;

import com.example.fasomarket.dto.AuthResponse;
import com.example.fasomarket.model.User;
import com.example.fasomarket.security.JwtService;
import com.example.fasomarket.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class OAuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/oauth2/authorization/{provider}")
    public ResponseEntity<?> oauth2Login(@PathVariable String provider) {
        // Redirection automatique vers le provider OAuth2
        return ResponseEntity.ok(Map.of("message", "Redirection vers " + provider));
    }

    @GetMapping("/oauth2/callback")
    public ResponseEntity<?> oauth2Callback(OAuth2AuthenticationToken token) {
        try {
            // Extraire les informations utilisateur
            String email = token.getPrincipal().getAttribute("email");
            String name = token.getPrincipal().getAttribute("name");
            String provider = token.getAuthorizedClientRegistrationId();

            // Créer ou récupérer l'utilisateur OAuth
            User user = authService.findOrCreateOAuthUser(email, name, provider);

            // Générer le token JWT
            String jwt = jwtService.generateToken(user.getId(), user.getRole().name());

            return ResponseEntity.ok(new AuthResponse(
                    jwt,
                    user.getId(),
                    user.getFullName(),
                    user.getPhone(),
                    user.getEmail(),
                    user.getRole(),
                    user.getIsActive(),
                    user.getIsVerified()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Erreur lors de l'authentification OAuth: " + e.getMessage()));
        }
    }
}