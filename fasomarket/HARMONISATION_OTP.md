# 🔄 HARMONISATION OTP - FASOMARKET

## ✅ **CORRECTIONS APPORTÉES**

### 🔐 **Authentification unifiée avec OTP**
- **Clients** : `nom + téléphone + code_otp`
- **Vendeurs** : `email + password` OU `téléphone + code_otp`

### 🏗️ **Modèles harmonisés**
- **User** : Relation `otpCodes()` ajoutée
- **Vendeur** : Champs `nom_entreprise`, `description`, `numero_registre_commerce` ajoutés

### 📱 **Flux OTP complet**
1. `POST /envoyer-otp` → Génération et envoi SMS
2. `POST /verifier-otp` → Validation du code
3. `POST /inscription-client` → Inscription avec `code_otp` vérifié
4. `POST /inscription-vendeur` → Inscription avec `code_otp` vérifié
5. `POST /connexion` → Connexion avec `code_otp` pour clients

### 🛠️ **API JavaScript mise à jour**
```javascript
// Nouveau flux d'inscription client
await fasoMarketAPI.otp.envoyer(telephone, 'inscription');
await fasoMarketAPI.otp.verifier(telephone, code);
await fasoMarketAPI.auth.registerClient(nom, prenom, telephone, codeOtp);

// Nouveau flux de connexion client
await fasoMarketAPI.otp.envoyer(telephone, 'connexion');
await fasoMarketAPI.otp.verifier(telephone, code);
await fasoMarketAPI.auth.loginClient(nom, telephone, codeOtp);
```

### 🔒 **Sécurité renforcée**
- **Tous les téléphones** nécessitent une vérification OTP
- **Codes expirés** automatiquement après 5 minutes
- **Usage unique** des codes OTP
- **Suppression automatique** des anciens codes

## 🎯 **RÉSULTAT**
L'API FasoMarket est maintenant **100% harmonisée** avec le système OTP pour toutes les fonctionnalités d'authentification, garantissant une sécurité uniforme pour clients et vendeurs.