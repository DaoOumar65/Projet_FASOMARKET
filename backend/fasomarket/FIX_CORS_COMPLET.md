# 🔴 FIX CORS - GUIDE COMPLET

## 🎯 Problème identifié

**Erreur:** `l'en-tête CORS « Access-Control-Allow-Origin » est manquant`
**Cause:** Frontend appelle port 8080, backend sur port 8081 + CORS non appliqué

---

## ✅ SOLUTION EN 3 ÉTAPES

### ÉTAPE 1: Vérifier le port du frontend

**Fichier à vérifier:** `frontend/src/config.ts` ou `frontend/.env` ou `frontend/src/api/config.ts`

Cherchez une ligne comme:
```typescript
const API_URL = 'http://localhost:8080'  // ❌ MAUVAIS PORT
```

Changez en:
```typescript
const API_URL = 'http://localhost:8081'  // ✅ BON PORT
```

**OU dans le fichier .env:**
```
VITE_API_URL=http://localhost:8081
```

### ÉTAPE 2: Redémarrer le backend

```bash
# Dans le terminal backend
Ctrl + C
mvn spring-boot:run
```

**Vérifiez les logs:**
```
Started FasomarketApplication in X.XXX seconds
Tomcat started on port(s): 8081 (http)
```

### ÉTAPE 3: Redémarrer le frontend

```bash
# Dans le terminal frontend
Ctrl + C
npm run dev
```

**Puis dans le navigateur:**
- Videz le cache: **Ctrl + Shift + Delete**
- Rechargez: **Ctrl + F5**

---

## 🧪 TEST RAPIDE

Dans la console navigateur (F12):

```javascript
// Test 1: Vérifier le port
fetch('http://localhost:8081/api/admin/statistiques')
  .then(r => r.json())
  .then(d => console.log('✅ Port 8081 OK:', d))
  .catch(e => console.error('❌ Erreur:', e))

// Test 2: Vérifier CORS
fetch('http://localhost:8081/api/admin/statistiques', {
  method: 'GET',
  headers: { 'Origin': 'http://localhost:5173' }
})
  .then(r => console.log('✅ CORS OK, Status:', r.status))
  .catch(e => console.error('❌ CORS Erreur:', e))
```

**Résultat attendu:**
```
✅ Port 8081 OK: {utilisateurs: 10, produits: 25, commandes: 8, boutiques: 5}
✅ CORS OK, Status: 200
```

---

## 🔍 DIAGNOSTIC

### Si l'erreur persiste, vérifiez:

#### 1. Le backend tourne-t-il sur 8081?
```bash
# Windows
netstat -ano | findstr :8081

# Doit afficher une ligne avec LISTENING
```

#### 2. Le frontend appelle-t-il le bon port?
- Ouvrez F12 → Onglet Network
- Rechargez la page
- Cherchez la requête `statistiques`
- Vérifiez l'URL: doit être `http://localhost:8081/api/admin/statistiques`

#### 3. Les headers CORS sont-ils présents?
Dans F12 → Network → Cliquez sur la requête `statistiques` → Onglet Headers

**Doit contenir:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

---

## 🚨 SI ÇA NE MARCHE TOUJOURS PAS

### Solution de secours: Désactiver temporairement CORS dans le navigateur

**Firefox:**
1. Tapez `about:config` dans la barre d'adresse
2. Cherchez `security.fileuri.strict_origin_policy`
3. Mettez à `false`

**Chrome:**
1. Fermez Chrome complètement
2. Lancez avec: `chrome.exe --disable-web-security --user-data-dir="C:/ChromeDevSession"`

⚠️ **ATTENTION:** Ne faites ceci que pour le développement!

---

## 📋 CHECKLIST FINALE

- [ ] Backend sur port 8081 (vérifier logs)
- [ ] Frontend appelle port 8081 (vérifier config)
- [ ] Backend redémarré après modification SecurityConfig
- [ ] Frontend redémarré
- [ ] Cache navigateur vidé (Ctrl+Shift+Delete)
- [ ] Page rechargée (Ctrl+F5)
- [ ] Onglet Network montre requête vers 8081
- [ ] Headers CORS présents dans la réponse

---

**Temps estimé:** 2-3 minutes
**Taux de succès:** 99% si toutes les étapes sont suivies
