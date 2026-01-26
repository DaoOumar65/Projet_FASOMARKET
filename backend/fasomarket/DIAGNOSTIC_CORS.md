# 🔧 Diagnostic Erreurs CORS - FasoMarket

## ❌ Problème Identifié
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
Network Error
```

## 🔍 Vérifications Immédiates

### 1. Backend Démarré ?
```bash
# Vérifier si le backend tourne sur le port 8081
curl http://localhost:8081/api/vendeur/test-connexion
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "message": "Backend accessible",
  "timestamp": "2026-01-13T..."
}
```

### 2. Port Correct ?
- ✅ Backend : `http://localhost:8081`
- ✅ Frontend : Vérifier l'URL dans les appels API

### 3. Redémarrer le Backend
```bash
cd c:\SiteCommercial\backend\fasomarket
mvn spring-boot:run
```

## ✅ Corrections Appliquées

### 1. Configuration CORS Plus Permissive
```java
// Configuration mise à jour pour accepter toutes les origines
configuration.addAllowedOriginPattern("*");
configuration.addAllowedMethod("*");
configuration.addAllowedHeader("*");
```

### 2. Endpoint de Test Ajouté
```
GET /api/vendeur/test-connexion
```

## 🧪 Tests de Diagnostic

### Test 1: Connectivité Backend
```bash
curl http://localhost:8081/api/vendeur/test-connexion
```

### Test 2: Endpoint Problématique
```bash
curl -X GET "http://localhost:8081/api/vendeur/statut-compte" \
  -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000"
```

### Test 3: Depuis le Navigateur
Ouvrir dans le navigateur :
```
http://localhost:8081/api/vendeur/test-connexion
```

## 🎯 Solutions par Ordre de Priorité

### Solution 1: Redémarrer le Backend
```bash
# Arrêter l'application (Ctrl+C)
# Puis redémarrer
mvn spring-boot:run
```

### Solution 2: Vérifier les Ports
- Backend doit être sur `:8081`
- Frontend sur un autre port (ex: `:3000`, `:5173`)

### Solution 3: Désactiver Temporairement le Firewall
```bash
# Windows - Désactiver temporairement le pare-feu
# Ou ajouter une exception pour le port 8081
```

### Solution 4: Configuration Frontend
```typescript
// Vérifier l'URL de base dans le frontend
const API_BASE_URL = 'http://localhost:8081';
```

## 🚨 Vérifications Rapides

1. ✅ **Backend démarré** - Logs Spring Boot visibles
2. ✅ **Port 8081 libre** - Aucun autre service dessus
3. ✅ **Firewall/Antivirus** - Pas de blocage
4. ✅ **URL correcte** - `localhost:8081` pas `127.0.0.1`

## 📋 Commandes de Test

```bash
# Test 1: Ping du backend
curl http://localhost:8081/api/vendeur/test-connexion

# Test 2: Avec headers
curl -X GET "http://localhost:8081/api/vendeur/statut-compte" \
  -H "X-User-Id: test-uuid" \
  -H "Content-Type: application/json"

# Test 3: Options (preflight)
curl -X OPTIONS "http://localhost:8081/api/vendeur/statut-compte" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

## ✅ Statut Après Corrections

- ✅ Configuration CORS permissive
- ✅ Endpoint de test ajouté
- ✅ Headers CORS exposés
- ✅ Toutes les méthodes autorisées