package com.example.fasomarket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend accessible");
        response.put("timestamp", LocalDateTime.now());
        response.put("port", "8081");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cors")
    public ResponseEntity<?> testCors() {
        Map<String, Object> response = new HashMap<>();
        response.put("cors", "OK");
        response.put("message", "CORS configuré correctement");
        return ResponseEntity.ok(response);
    }
}