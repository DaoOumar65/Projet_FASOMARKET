package com.example.fasomarket.controller;

import com.example.fasomarket.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/orders/recalculate-totals")
    @Operation(summary = "Recalculer totaux commandes", description = "Recalcule les totaux des commandes avec montant zéro")
    public ResponseEntity<?> recalculerTotaux() {
        try {
            orderService.recalculerTotauxCommandes();
            return ResponseEntity.ok("Totaux des commandes recalculés avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }
}