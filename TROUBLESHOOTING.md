# Guide de résolution des problèmes d'intégration

## Problèmes courants et solutions

### 1. Erreur CORS (Cross-Origin Resource Sharing)

**Symptômes :**
- Erreur dans la console : "Access to fetch at 'http://localhost:8081' from origin 'http://localhost:5173' has been blocked by CORS policy"
- Les requêtes API échouent avec des erreurs de réseau

**Solutions :**
1. Vérifier la configuration CORS dans le backend Spring Boot
2. S'assurer que l'origine `http://localhost:5173` est autorisée
3. Vérifier que les headers nécessaires sont autorisés

### 2. Backend inaccessible

**Symptômes :**
- Erreur de connexion refusée
- Timeout des requêtes
- Status 503 Service Unavailable

**Solutions :**
1. Vérifier que le backend Spring Boot est démarré
2. Vérifier que le port 8081 est libre et accessible
3. Tester l'endpoint de santé : `http://localhost:8081/actuator/health`

### 3. Erreurs d'authentification

**Symptômes :**
- Status 401 Unauthorized
- Status 403 Forbidden
- Token invalide ou expiré

**Solutions :**
1. Vérifier les identifiants de connexion
2. Vérifier que le token est correctement stocké dans localStorage
3. Vérifier que les headers Authorization et X-User-Id sont envoyés

### 4. Problèmes de types TypeScript

**Symptômes :**
- Erreurs de compilation TypeScript
- Types manquants ou incorrects
- Propriétés undefined

**Solutions :**
1. Vérifier que les interfaces correspondent aux réponses API
2. Ajouter des vérifications de nullité appropriées
3. Utiliser des types optionnels quand nécessaire

### 5. Données manquantes ou incorrectes

**Symptômes :**
- Propriétés undefined dans les composants
- Données vides ou nulles
- Structure de données inattendue

**Solutions :**
1. Vérifier la structure des réponses API avec les outils de développement
2. Ajouter des logs pour déboguer les données reçues
3. Utiliser des valeurs par défaut appropriées

## Scripts de diagnostic

### Test de connectivité rapide
```bash
# Tester la santé du backend
curl http://localhost:8081/actuator/health

# Tester un endpoint public
curl http://localhost:8081/api/public/accueil
```

### Test d'authentification
```bash
# Tester la connexion
curl -X POST http://localhost:8081/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{"telephone":"+22665300000","motDePasse":"admin123"}'
```

### Validation complète
```bash
# Exécuter le script de validation
node validate-integration.js
```

## Checklist de vérification

### Backend
- [ ] Spring Boot démarré sur le port 8081
- [ ] Base de données accessible
- [ ] Configuration CORS correcte
- [ ] Endpoints API fonctionnels
- [ ] Authentification configurée

### Frontend
- [ ] Vite dev server démarré sur le port 5173
- [ ] Services API configurés avec la bonne URL
- [ ] Types TypeScript à jour
- [ ] Gestion d'erreurs implémentée
- [ ] Authentification fonctionnelle

### Intégration
- [ ] Pas d'erreurs CORS
- [ ] Authentification end-to-end
- [ ] Données correctement mappées
- [ ] Gestion des erreurs appropriée
- [ ] Performance acceptable

## Logs utiles

### Frontend (Console du navigateur)
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');

// Vérifier l'état d'authentification
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Backend (Logs Spring Boot)
```bash
# Activer les logs SQL
logging.level.org.hibernate.SQL=DEBUG

# Activer les logs de sécurité
logging.level.org.springframework.security=DEBUG
```

## Contacts et ressources

- Documentation API : `http://localhost:8081/swagger-ui.html`
- Logs backend : Vérifier la console Spring Boot
- Logs frontend : Console du navigateur (F12)
- Base de données : Vérifier H2 Console si activée