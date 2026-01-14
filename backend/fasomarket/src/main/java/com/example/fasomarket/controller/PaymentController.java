package com.example.fasomarket.controller;

import com.example.fasomarket.dto.*;
import com.example.fasomarket.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/paiements")
@Tag(name = "Paiements", description = "Gestion des paiements")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/payer")
    @Operation(summary = "Payer une commande", description = "Effectue le paiement d'une commande")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paiement traité"),
        @ApiResponse(responseCode = "400", description = "Erreur de paiement"),
        @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    public ResponseEntity<?> payerCommande(
            @RequestHeader("X-User-Id") UUID clientId,
            @Valid @RequestBody PayerCommandeRequest request) {
        try {
            String result = paymentService.payerCommande(clientId, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}