# ⚠️ REDÉMARRAGE BACKEND REQUIS

## Problème actuel
```
Blocage CORS : l'en-tête CORS « Access-Control-Allow-Origin » est manquant
```

## Cause
Le CorsConfig.java a été modifié mais **le backend n'a pas été redémarré**.

## ✅ SOLUTION (3 étapes)

### 1. Arrêter le backend
```bash
# Dans le terminal où tourne Spring Boot
Ctrl + C
```

### 2. Redémarrer le backend
```bash
mvn spring-boot:run
```

### 3. Vérifier les logs
Vous devez voir:
```
Started FasomarketApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

## 🧪 Test après redémarrage

Dans la console navigateur (F12):
```javascript
fetch('http://localhost:8080/api/admin/statistiques', {
  headers: { 'X-User-Id': 'votre-user-id' }
})
.then(r => console.log('✅ CORS OK'))
.catch(e => console.error('❌ Erreur:', e))
```

## 📋 Checklist
- [ ] Backend arrêté (Ctrl+C)
- [ ] Backend redémarré (mvn spring-boot:run)
- [ ] Port 8080 actif
- [ ] Cache navigateur vidé (Ctrl+Shift+Delete)
- [ ] Page rechargée (Ctrl+F5)

## ⚡ Alternative rapide
Si vous utilisez un IDE (IntelliJ/Eclipse):
1. Cliquez sur le bouton STOP ⏹️
2. Cliquez sur le bouton RUN ▶️
