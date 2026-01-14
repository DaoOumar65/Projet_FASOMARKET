# 🔐 Identifiants de Test - FasoMarket

## 📋 Utilisateurs de Test Disponibles

### 👤 CLIENT
- **Téléphone:** `70123456`
- **Mot de passe:** `password123`
- **Nom:** Dao Test
- **Statut:** Actif

### 🛍️ VENDEUR (Compte Validé)
- **Téléphone:** `70654321`
- **Mot de passe:** `password123`
- **Nom:** Vendeur Test
- **Statut:** COMPTE_VALIDE (peut créer une boutique)

### 🛍️ VENDEUR (En Attente)
- **Téléphone:** `70111222`
- **Mot de passe:** `password123`
- **Nom:** Dao Test
- **Statut:** EN_ATTENTE_VALIDATION (doit être approuvé par l'admin)

### 👨‍💼 ADMIN
- **Téléphone:** `70000000`
- **Mot de passe:** `admin123`
- **Nom:** Admin FasoMarket
- **Statut:** Actif

## 🚨 Erreur "Mot de passe incorrect"

Si vous obtenez cette erreur, vérifiez que vous utilisez exactement :
- Les **bons numéros de téléphone** (sans espaces ni tirets)
- Les **bons mots de passe** (sensibles à la casse)

## 🔄 Flux de Test Recommandé

1. **Connexion Admin** → Valider les vendeurs en attente
2. **Connexion Vendeur** → Créer une boutique
3. **Connexion Admin** → Valider les boutiques
4. **Connexion Client** → Parcourir les boutiques actives

## 🛠️ Dépannage

### Problème de Connexion
```
Error: Request failed with status code 400
Détails: { message: "Mot de passe incorrect", success: false }
```

**Solutions :**
1. Vérifier le numéro de téléphone (format exact)
2. Vérifier le mot de passe (respecter la casse)
3. Vérifier que le backend est démarré sur le port 8081
4. Vérifier la base de données PostgreSQL

### Vérification Backend
```bash
# Vérifier que le backend fonctionne
curl http://localhost:8081/api/auth/connexion -X POST \
  -H "Content-Type: application/json" \
  -d '{"telephone":"70123456","motDePasse":"password123"}'
```

## 📊 Base de Données

Les utilisateurs sont stockés dans PostgreSQL avec :
- Mots de passe hashés avec BCrypt
- Rôles : CLIENT, VENDOR, ADMIN
- Statuts : ACTIF, EN_ATTENTE_VALIDATION, COMPTE_VALIDE

## 🎯 Conseils

- Utilisez **exactement** les identifiants listés ci-dessus
- Les mots de passe sont **sensibles à la casse**
- Les numéros de téléphone ne doivent **pas** contenir d'espaces
- Assurez-vous que le backend PostgreSQL est démarré