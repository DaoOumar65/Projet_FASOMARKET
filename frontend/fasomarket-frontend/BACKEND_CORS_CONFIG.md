# 🚨 BACKEND - Configuration CORS URGENTE

## ❌ Problème actuel
```
Blocage d'une requête multiorigine (Cross-Origin Request) : 
la politique « Same Origin » ne permet pas de consulter la ressource distante 
située sur http://localhost:8081/api/client/*
```

## ✅ Solution - Configuration CORS

### 1. Créer `CorsConfig.java`

```java
package com.example.fasomarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 2. Vérifier `application.properties`

```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 3. Ajouter aux Controllers existants

```java
@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ClientCommandeController {
    // ... code existant
}
```

## 🔧 Endpoints manquants à créer

### 1. **DELETE /api/client/panier/vider** ⚠️ URGENT - CAUSE 500 ERROR
```java
@DeleteMapping("/panier/vider")
public ResponseEntity<Map<String, String>> viderPanier(@RequestHeader("X-User-Id") String clientId) {
    try {
        // Supprimer tous les items du panier pour ce client
        panierService.viderPanier(clientId);
        return ResponseEntity.ok(Map.of("message", "Panier vidé avec succès"));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Erreur lors du vidage du panier"));
    }
}
```

### 2. **GET /api/client/panier** ⚠️ URGENT
```java
@GetMapping("/panier")
public ResponseEntity<List<PanierItemDTO>> getPanier(@RequestHeader("X-User-Id") String clientId) {
    List<PanierItemDTO> items = panierService.getPanierByClient(clientId);
    return ResponseEntity.ok(items);
}
```

### 3. **GET /api/client/notifications/compteur** ⚠️ URGENT
```java
@GetMapping("/notifications/compteur")
public ResponseEntity<Map<String, Integer>> getCompteurNotifications(@RequestHeader("X-User-Id") String clientId) {
    int count = notificationService.getCompteurNonLues(clientId);
    return ResponseEntity.ok(Map.of("count", count));
}
```

## 🚀 Redémarrer le serveur

Après avoir ajouté la configuration CORS :
1. Arrêter le serveur Spring Boot
2. Redémarrer avec `mvn spring-boot:run`
3. Vérifier que le serveur démarre sur `http://localhost:8081`

## ✅ Test

Une fois redémarré, les erreurs CORS devraient disparaître et les appels API fonctionner normalement.

**IMPORTANT**: Sans cette configuration CORS, le frontend ne peut pas communiquer avec le backend ! 🔥