# 📋 Harmonisation Système FasoMarket

## 🔄 Changements Appliqués

### **Authentification**
- **Client** : Suppression du champ `email` (optionnel → supprimé)
- **Vendeur** : `email` devient obligatoire, suppression de `carteIdentite`

### **Création Boutique**
- **Ajout** : `numeroCnib` (obligatoire, format: B12345678)
- **Ajout** : `fichierIfu` (obligatoire, PDF/Image, max 5MB)

### **Base de Données**
- Nouvelles colonnes : `numero_cnib`, `fichier_ifu` dans table `shops`
- Index ajoutés pour optimisation

### **API Endpoints**
- `POST /api/files/upload-ifu` - Upload fichier IFU
- Mise à jour des validations dans tous les endpoints

## 🚀 Migration

### 1. **Exécuter le script SQL**
```bash
psql -d fasomarket -f database_harmonization.sql
```

### 2. **Redémarrer l'application**
```bash
mvn spring-boot:run
```

### 3. **Tester les nouveaux endpoints**
- Inscription client sans email
- Inscription vendeur avec email obligatoire
- Création boutique avec CNIB + IFU

## 📝 Validation Frontend

### **Formulaires à mettre à jour :**
1. **Inscription Client** - Supprimer champ email
2. **Inscription Vendeur** - Rendre email obligatoire, supprimer CNIB
3. **Création Boutique** - Ajouter CNIB + upload IFU

### **Exemples de validation :**
```javascript
// Client
const clientData = {
  nomComplet: "Jean Dupont",
  telephone: "+22670123456", 
  motDePasse: "password123"
  // PAS d'email
};

// Vendeur  
const vendeurData = {
  nomComplet: "Marie Traoré",
  telephone: "+22670654321",
  email: "marie@example.com", // OBLIGATOIRE
  motDePasse: "password123"
  // PAS de carteIdentite
};

// Boutique
const boutiqueData = {
  nom: "Boutique Marie",
  numeroCnib: "B10802321", // OBLIGATOIRE
  fichierIfu: "path/to/ifu.pdf", // OBLIGATOIRE
  // ... autres champs
};
```

## ✅ Points de Contrôle

- [ ] Script SQL exécuté
- [ ] Application redémarrée
- [ ] Tests d'inscription client sans email
- [ ] Tests d'inscription vendeur avec email
- [ ] Tests de création boutique avec CNIB/IFU
- [ ] Upload de fichiers IFU fonctionnel
- [ ] Frontend mis à jour selon nouvelles spécifications