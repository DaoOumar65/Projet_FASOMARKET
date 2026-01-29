package com.example.fasomarket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/variantes")
@CrossOrigin(origins = "http://localhost:5173")
public class SimpleVariantesController {

    @GetMapping("/produit/{id}")
    public ResponseEntity<List<Map<String, Object>>> getVariantes(@PathVariable String id) {
        
        List<Map<String, Object>> variantes = new ArrayList<>();
        
        Map<String, Object> variante1 = new HashMap<>();
        variante1.put("id", 1);
        variante1.put("produitId", id);
        variante1.put("couleur", "Rouge");
        variante1.put("taille", "M");
        variante1.put("stock", 10);
        variante1.put("sku", "SKU-001");
        variantes.add(variante1);
        
        Map<String, Object> variante2 = new HashMap<>();
        variante2.put("id", 2);
        variante2.put("produitId", id);
        variante2.put("couleur", "Bleu");
        variante2.put("taille", "L");
        variante2.put("stock", 5);
        variante2.put("sku", "SKU-002");
        variantes.add(variante2);
        
        return ResponseEntity.ok(variantes);
    }

    @PostMapping("/produit/{id}")
    public ResponseEntity<Map<String, Object>> createVariante(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", System.currentTimeMillis());
        response.put("produitId", id);
        response.put("couleur", request.getOrDefault("couleur", "Default"));
        response.put("taille", request.getOrDefault("taille", "M"));
        response.put("stock", request.getOrDefault("stock", 0));
        response.put("sku", "SKU-" + System.currentTimeMillis());
        response.put("status", "created");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stock/{id}")
    public ResponseEntity<Map<String, Object>> getStock(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("stockGlobal", 100);
        response.put("stockVariantesTotal", 15);
        response.put("stockDisponible", 85);
        response.put("stockValide", true);
        
        return ResponseEntity.ok(response);
    }
}