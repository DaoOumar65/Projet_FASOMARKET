package com.example.fasomarket.controller;

import com.example.fasomarket.dto.ConnexionRequest;
import com.example.fasomarket.dto.AuthResponse;
import com.example.fasomarket.model.Role;
import com.example.fasomarket.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendeur")
public class VendeurAuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/connexion")
    public ResponseEntity<Map<String, Object>> connexionVendeur(@RequestBody ConnexionRequest request) {
        try {
            AuthResponse authResponse = authService.connexion(request);
            
            // Vérifier que c'est bien un vendeur
            if (!Role.VENDOR.equals(authResponse.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Accès réservé aux vendeurs"
                ));
            }
            
            // Convertir AuthResponse en Map
            Map<String, Object> response = Map.of(
                "success", true,
                "token", authResponse.getToken(),
                "userId", authResponse.getUserId(),
                "nomComplet", authResponse.getNomComplet(),
                "telephone", authResponse.getTelephone(),
                "email", authResponse.getEmail() != null ? authResponse.getEmail() : "",
                "role", authResponse.getRole().name(),
                "actif", authResponse.getEstActif(),
                "verifie", authResponse.getEstVerifie()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}