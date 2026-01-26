# 🔧 CONFIGURATION CORS - BACKEND SPRING BOOT

## ❌ Problème actuel

```
Blocage d'une requête multiorigines (Cross-Origin Request) : 
la politique « Same Origin » ne permet pas de consulter la ressource 
distante située sur http://localhost:8080/api/admin/statistiques. 
Raison : l'en-tête CORS « Access-Control-Allow-Origin » est manquant.
```

## ✅ Solution : Configuration CORS globale

### 1️⃣ Créer la classe de configuration CORS

**Fichier:** `src/main/java/com/fasomarket/config/CorsConfig.java`

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
        
        // Autoriser les requêtes depuis le frontend
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",  // Alternative port
            "http://127.0.0.1:5173"
        ));
        
        // Autoriser tous les headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Autoriser toutes les méthodes HTTP
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Autoriser les credentials (cookies, headers d'authentification)
        config.setAllowCredentials(true);
        
        // Exposer les headers personnalisés
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-User-Id",
            "Content-Type"
        ));
        
        // Durée de cache de la configuration CORS (1 heure)
        config.setMaxAge(3600L);
        
        // Appliquer la configuration à toutes les routes
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### 2️⃣ Alternative : Configuration avec WebMvcConfigurer

**Fichier:** `src/main/java/com/fasomarket/config/WebConfig.java`

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
                .allowedOrigins(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:5173"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Authorization", "X-User-Id", "Content-Type")
                .maxAge(3600);
    }
}
```

### 3️⃣ Configuration avec Spring Security (si utilisé)

**Fichier:** `src/main/java/com/fasomarket/config/SecurityConfig.java`

```java
package com.fasomarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-User-Id", "Content-Type"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 🎯 Configuration recommandée

### Pour le développement

Utilisez la **Solution 1 (CorsFilter)** car elle est simple et fonctionne immédiatement.

### Pour la production

Ajoutez dans `application.properties` :

```properties
# CORS Configuration
cors.allowed-origins=https://votre-domaine.com,https://www.votre-domaine.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600
```

Et modifiez la configuration pour lire depuis les properties :

```java
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## 🧪 Tester la configuration

### 1. Redémarrer le backend

```bash
mvn spring-boot:run
```

### 2. Vérifier les headers CORS

Ouvrir la console du navigateur et vérifier que la requête retourne :

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
```

### 3. Test avec curl

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-User-Id" \
     -X OPTIONS \
     http://localhost:8080/api/admin/statistiques -v
```

## ⚠️ Erreurs courantes

### Erreur 1 : CORS fonctionne mais pas avec credentials

**Solution :** Vérifier que `allowCredentials(true)` est défini ET que le frontend envoie `credentials: 'include'`

```typescript
fetch('http://localhost:8080/api/admin/statistiques', {
  headers: { 'X-User-Id': userId || '' },
  credentials: 'include'  // Ajouter cette ligne
})
```

### Erreur 2 : OPTIONS request bloquée

**Solution :** Ajouter explicitement la méthode OPTIONS dans allowedMethods

### Erreur 3 : Header X-User-Id bloqué

**Solution :** Ajouter X-User-Id dans exposedHeaders

```java
config.setExposedHeaders(Arrays.asList("X-User-Id", "Authorization"));
```

## 📝 Checklist de vérification

- [ ] Configuration CORS créée dans le backend
- [ ] Backend redémarré
- [ ] Port frontend correct (5173 pour Vite)
- [ ] allowCredentials = true
- [ ] Headers personnalisés exposés
- [ ] Méthodes HTTP autorisées
- [ ] Test dans le navigateur réussi
- [ ] Pas d'erreur CORS dans la console

## 🚀 Résultat attendu

Après configuration, les requêtes du frontend vers le backend doivent fonctionner sans erreur CORS :

```
✅ GET http://localhost:8080/api/admin/statistiques - 200 OK
✅ Headers CORS présents
✅ Données reçues correctement
```

---

**Note importante :** En production, ne jamais utiliser `allowedOrigins("*")` avec `allowCredentials(true)`. Toujours spécifier les domaines exacts.
