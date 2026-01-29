package com.example.fasomarket.controller;

import com.example.fasomarket.service.FormOptionsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/vendeur")
public class VendeurFormController {

    @Autowired
    private FormOptionsService formOptionsService;

    @GetMapping("/form-options")
    public ResponseEntity<Map<String, Object>> getFormOptions() {
        Map<String, Object> options = formOptionsService.getAllFormOptions();
        return ResponseEntity.ok(options);
    }
    
    @GetMapping("/form-options/{category}")
    public ResponseEntity<Map<String, Object>> getFormOptionsForCategory(@PathVariable String category) {
        Map<String, Object> options = formOptionsService.getOptionsForCategory(category);
        return ResponseEntity.ok(options);
    }
}