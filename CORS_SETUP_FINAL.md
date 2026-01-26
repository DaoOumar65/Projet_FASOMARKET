# ✅ ENDPOINT STATISTIQUES CRÉÉ - CONFIGURATION CORS REQUISE

## 🎉 Endpoint disponible

```
GET http://localhost:8080/api/admin/statistiques
```

**Retourne:**
```json
{
  "utilisateurs": 10,
  "produits": 25,
  "commandes": 8,
  "boutiques": 5
}
```

## ❌ Problème actuel

Le frontend ne peut pas accéder à cet endpoint à cause de CORS :

```
Blocage d'une requête multiorigines (Cross-Origin Request) : 
la politique « Same Origin » ne permet pas de consulter la ressource 
distante située sur http://localhost:8080/api/admin/statistiques. 
Raison : l'en-tête CORS « Access-Control-Allow-Origin » est manquant.
```

## ✅ SOLUTION : Ajouter la configuration CORS

### Option 1 : CorsFilter (Recommandé - Simple)

**Créer:** `src/main/java/com/fasomarket/config/CorsConfig.java`

```java
package com.fasomarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Autoriser le frontend Vite
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // Autoriser toutes les méthodes HTTP
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Autoriser tous les headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Autoriser les credentials
        config.setAllowCredentials(true);
        
        // Appliquer à toutes les routes
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### Option 2 : WebMvcConfigurer (Alternative)

**Créer:** `src/main/java/com/fasomarket/config/WebConfig.java`

```java
package com.fasomarket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 🚀 Étapes finales

### 1. Ajouter la configuration CORS (choisir Option 1 ou 2)

### 2. Redémarrer le backend
```bash
mvn spring-boot:run
```

### 3. Tester dans le navigateur
```
1. Ouvrir http://localhost:5173/admin/dashboard
2. Ouvrir la console (F12)
3. Vérifier qu'il n'y a plus d'erreur CORS
4. Les statistiques doivent s'afficher : 10, 25, 8, 5
```

## ✅ Résultat attendu

**Dashboard Admin affichera:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Utilisateurs    │  │ Produits        │  │ Commandes       │  │ Boutiques       │
│      10         │  │      25         │  │       8         │  │       5         │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Console navigateur:**
```
✅ GET http://localhost:8080/api/admin/statistiques - 200 OK
✅ Response: {utilisateurs: 10, produits: 25, commandes: 8, boutiques: 5}
✅ Pas d'erreur CORS
```

## 🔍 Vérification rapide

**Test avec curl:**
```bash
curl -H "Origin: http://localhost:5173" \
     -H "X-User-Id: admin-id" \
     -X GET \
     http://localhost:8080/api/admin/statistiques -v
```

**Doit retourner:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Credentials: true
< Content-Type: application/json

{"utilisateurs":10,"produits":25,"commandes":8,"boutiques":5}
```

## ⚠️ Note importante

Si vous utilisez **Spring Security**, ajoutez aussi dans `SecurityConfig.java`:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/admin/**").permitAll() // Temporaire pour test
            .anyRequest().authenticated()
        );
    return http.build();
}
```

---

**Temps estimé:** 2 minutes pour ajouter la config + redémarrer
**Impact:** Dashboard Admin fonctionnel immédiatement ! 🎉
