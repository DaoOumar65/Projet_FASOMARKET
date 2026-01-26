package com.example.fasomarket.controller;

import com.example.fasomarket.service.PayDunyaService;
import com.example.fasomarket.dto.PaymentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PayDunyaService payDunyaService;

    @PostMapping("/initier")
    public ResponseEntity<?> initierPaiement(@RequestBody PaymentRequest request) {
        try {
            Map<String, Object> response = payDunyaService.initierPaiementPayDunya(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur paiement: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhookPayDunya(@RequestBody Map<String, Object> webhookData) {
        try {
            payDunyaService.traiterWebhookPayDunya(webhookData);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/statut/{transactionId}")
    public ResponseEntity<?> verifierStatut(@PathVariable String transactionId) {
        try {
            Map<String, Object> statut = payDunyaService.verifierStatutPayDunya(transactionId);
            return ResponseEntity.ok(statut);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/simuler-succes/{transactionId}")
    public ResponseEntity<?> simulerSuccesTest(@PathVariable String transactionId) {
        try {
            Map<String, Object> webhookData = new HashMap<>();
            webhookData.put("status", "completed");
            webhookData.put("invoice_token", transactionId);
            
            payDunyaService.traiterWebhookPayDunya(webhookData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Paiement test simulé avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/simuler-echec/{transactionId}")
    public ResponseEntity<?> simulerEchecTest(@PathVariable String transactionId) {
        try {
            Map<String, Object> webhookData = new HashMap<>();
            webhookData.put("status", "failed");
            webhookData.put("invoice_token", transactionId);
            
            payDunyaService.traiterWebhookPayDunya(webhookData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Échec paiement test simulé");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}