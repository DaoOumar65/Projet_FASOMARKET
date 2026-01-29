package com.example.fasomarket.controller;

import com.example.fasomarket.model.ProduitVariante;
import com.example.fasomarket.service.StockVarianteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendeur/stock")
public class StockVarianteController {

    @Autowired
    private StockVarianteService stockVarianteService;

    /**
     * Réapprovisionner une variante
     */
    @PostMapping("/variante/{varianteId}/reapprovisionner")
    public ResponseEntity<Map<String, Object>> reapprovisionnerVariante(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @PathVariable Long varianteId,
            @RequestBody Map<String, Integer> request) {
        
        try {
            int quantite = request.get("quantite");
            if (quantite <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La quantité doit être positive"
                ));
            }
            
            stockVarianteService.reapprovisionnerVariante(vendorUserId, varianteId, quantite);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Réapprovisionnement effectué avec succès"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Obtenir les variantes en rupture de stock
     */
    @GetMapping("/variantes/rupture")
    public ResponseEntity<List<ProduitVariante>> getVariantesEnRupture(
            @RequestHeader("X-User-Id") UUID vendorUserId) {
        
        List<ProduitVariante> variantes = stockVarianteService.getVariantesEnRupture(vendorUserId);
        return ResponseEntity.ok(variantes);
    }

    /**
     * Obtenir les variantes avec stock faible
     */
    @GetMapping("/variantes/stock-faible")
    public ResponseEntity<List<ProduitVariante>> getVariantesStockFaible(
            @RequestHeader("X-User-Id") UUID vendorUserId,
            @RequestParam(defaultValue = "5") int seuil) {
        
        List<ProduitVariante> variantes = stockVarianteService.getVariantesStockFaible(vendorUserId, seuil);
        return ResponseEntity.ok(variantes);
    }

    /**
     * Vérifier la disponibilité d'une variante
     */
    @GetMapping("/variante/{varianteId}/disponibilite")
    public ResponseEntity<Map<String, Object>> verifierDisponibilite(
            @PathVariable Long varianteId,
            @RequestParam int quantite) {
        
        boolean disponible = stockVarianteService.isVarianteDisponible(varianteId, quantite);
        
        return ResponseEntity.ok(Map.of(
            "disponible", disponible,
            "varianteId", varianteId,
            "quantiteDemandee", quantite
        ));
    }

    /**
     * Obtenir le stock total d'un produit
     */
    @GetMapping("/produit/{produitId}/stock-total")
    public ResponseEntity<Map<String, Object>> getStockTotalProduit(@PathVariable UUID produitId) {
        int stockTotal = stockVarianteService.getStockTotalProduit(produitId);
        
        return ResponseEntity.ok(Map.of(
            "produitId", produitId,
            "stockTotal", stockTotal
        ));
    }
}