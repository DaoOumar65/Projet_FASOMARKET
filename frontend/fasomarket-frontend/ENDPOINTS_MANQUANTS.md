# Endpoints manquants côté Backend - Analyse Frontend

## 🔍 Analyse des services frontend

Après analyse complète des services et composants frontend, voici les endpoints qui sont appelés côté client mais potentiellement manquants ou incomplets côté backend :

## 📊 **Dashboard Endpoints**

### Client Dashboard (`/api/client/dashboard`)
**Utilisé dans :** `DashboardClient.tsx`
**Structure attendue :**
```json
{
  "statistiques": {
    "commandesEnCours": number,
    "commandesTerminees": number,
    "montantTotalDepense": number,
    "notificationsNonLues": number
  },
  "commandesRecentes": Commande[],
  "recommandations": Produit[]
}
```

### Vendeur Dashboard (`/api/vendeur/dashboard`)
**Utilisé dans :** `DashboardVendeur.tsx`
**Structure attendue :**
```json
{
  "statistiques": {
    "nouvellesCommandes": number,
    "ventesAujourdhui": number,
    "produitsEnStock": number,
    "notificationsNonLues": number
  },
  "boutique": Boutique,
  "commandesRecentes": Commande[],
  "produitsRecents": Produit[]
}
```

### Admin Dashboard (`/api/admin/dashboard`)
**Utilisé dans :** `DashboardAdmin.tsx`
**Structure attendue :**
```json
{
  "statistiques": {
    "totalUtilisateurs": number,
    "totalVendeurs": number,
    "totalClients": number,
    "totalBoutiques": number,
    "boutiquesActives": number,
    "boutiquesEnAttente": number,
    "totalProduits": number,
    "totalCommandes": number,
    "commandesAujourdhui": number,
    "chiffreAffairesTotal": number,
    "chiffreAffairesMois": number
  },
  "vendeursEnAttente": any[],
  "boutiquesEnAttente": any[],
  "commandesRecentes": any[],
  "alertes": any[]
}
```

## 📈 **Analytics Endpoint**

### Vendeur Analytics (`/api/vendeur/analytics`)
**Utilisé dans :** `VendeurAnalytics.tsx`
**Structure attendue :**
```json
{
  "ventesParMois": [
    {
      "mois": string,
      "ventes": number,
      "chiffreAffaires": number
    }
  ],
  "produitsPopulaires": [
    {
      "nom": string,
      "quantiteVendue": number,
      "chiffreAffaires": number
    }
  ],
  "statistiquesGenerales": {
    "chiffreAffairesTotal": number,
    "chiffreAffairesMois": number,
    "chiffreAffairesHier": number,
    "nombreVentesTotales": number,
    "nombreVentesMois": number,
    "nombreVentesHier": number,
    "nombreProduitsActifs": number,
    "tauxConversion": number,
    "panierMoyen": number
  },
  "evolutionVentes": {
    "pourcentageVentes": number,
    "pourcentageCA": number,
    "tendanceVentes": "up" | "down" | "stable",
    "tendanceCA": "up" | "down" | "stable"
  }
}
```

## 🛒 **Panier & Commandes**

### Panier Client
- ✅ `POST /api/client/panier/ajouter` - Ajouter au panier
- ✅ `GET /api/client/panier` - Récupérer le panier
- ✅ `DELETE /api/client/panier/{itemId}` - Supprimer un item
- ✅ `DELETE /api/client/panier/vider` - Vider le panier

### Commandes Client
- ✅ `POST /api/client/commandes/creer` - Créer une commande
- ✅ `GET /api/client/historique-commandes` - Historique
- ✅ `GET /api/client/commandes/{id}` - Détail commande

## ❤️ **Favoris Client**

### Endpoints Favoris
**Utilisés dans :** `ClientFavoris.tsx`
- ✅ `GET /api/client/favoris` - Liste des favoris
- ✅ `POST /api/client/favoris/ajouter` - Ajouter aux favoris
- ✅ `DELETE /api/client/favoris/{produitId}` - Supprimer des favoris

## 📍 **Adresses Client**

### Gestion Adresses
- ✅ `GET /api/client/adresses` - Liste des adresses
- ✅ `POST /api/client/adresses/ajouter` - Ajouter une adresse
- ✅ `PUT /api/client/adresses/{id}` - Modifier une adresse
- ✅ `DELETE /api/client/adresses/{id}` - Supprimer une adresse
- ✅ `PUT /api/client/adresses/{id}/defaut` - Définir par défaut

## 🔔 **Notifications**

### Client Notifications
- ✅ `GET /api/client/notifications` - Liste des notifications
- ✅ `GET /api/client/notifications/compteur` - Compteur non lues
- ✅ `PUT /api/client/notifications/{id}/lue` - Marquer comme lue

### Vendeur Notifications
- ✅ `GET /api/vendeur/notifications` - Liste des notifications
- ✅ `PUT /api/vendeur/notifications/settings` - Paramètres notifications

## 🏪 **Vendeur - Boutique**

### Gestion Boutique
- ✅ `POST /api/vendeur/boutiques/creer` - Créer boutique
- ✅ `GET /api/vendeur/boutiques` - Récupérer boutique
- ✅ `PUT /api/vendeur/boutiques/{id}` - Modifier boutique
- ✅ `POST /api/vendeur/boutiques/{id}/soumettre` - Soumettre validation
- ❓ `GET /api/vendeur/categories/{id}/form-fields` - Champs formulaire catégorie

## 📦 **Vendeur - Produits**

### Gestion Produits
- ✅ `POST /api/vendeur/produits/creer` - Créer produit
- ✅ `GET /api/vendeur/produits` - Liste produits
- ✅ `PUT /api/vendeur/produits/{id}` - Modifier produit
- ✅ `DELETE /api/vendeur/produits/{id}` - Supprimer produit
- ❓ `GET /api/vendeur/gestion-stock` - Gestion du stock

## 🛍️ **Vendeur - Commandes**

### Gestion Commandes Vendeur
- ✅ `GET /api/vendeur/commandes` - Liste des commandes
- ✅ `PUT /api/vendeur/commandes/{id}/statut` - Changer statut

## 👤 **Profil & Paramètres**

### Profil Client
- ✅ `GET /api/client/profil` - Récupérer profil
- ✅ `PUT /api/client/profil` - Modifier profil

### Profil Vendeur
- ✅ `PUT /api/vendeur/profil` - Modifier profil vendeur

## 🔐 **Authentification**

### Auth Endpoints
- ✅ `POST /api/auth/connexion` - Connexion
- ✅ `POST /api/auth/inscription-client` - Inscription client
- ✅ `POST /api/auth/inscription-vendeur` - Inscription vendeur
- ✅ `PUT /api/auth/changer-mot-de-passe` - Changer mot de passe

## 🌐 **Endpoints Publics**

### Public API
- ✅ `GET /api/public/accueil` - Page d'accueil
- ✅ `GET /api/public/recherche` - Recherche
- ✅ `GET /api/public/categories` - Liste catégories
- ✅ `GET /api/public/categories/{id}/vitrine` - Vitrine catégorie
- ✅ `GET /api/public/categories/{id}/produits` - Produits par catégorie
- ✅ `GET /api/public/boutiques` - Liste boutiques
- ✅ `GET /api/public/boutiques/{id}` - Détail boutique
- ✅ `GET /api/public/boutiques/{id}/produits` - Produits boutique
- ✅ `GET /api/public/produits` - Liste produits
- ✅ `GET /api/public/produits/{id}` - Détail produit

## 👨‍💼 **Admin - Validations**

### Validation Endpoints
- ✅ `GET /api/admin/validations` - Toutes les validations
- ✅ `GET /api/admin/validations/vendeurs` - Vendeurs en attente
- ✅ `GET /api/admin/validations/boutiques` - Boutiques en attente
- ✅ `PUT /api/admin/vendeurs/{id}/valider` - Valider vendeur
- ✅ `PUT /api/admin/boutiques/{id}/valider` - Valider boutique

## 🎯 **Endpoints prioritaires à implémenter/vérifier**

### 1. **Dashboards** (Haute priorité)
- `/api/client/dashboard`
- `/api/vendeur/dashboard` 
- `/api/admin/dashboard`

### 2. **Analytics Vendeur** (Moyenne priorité)
- `/api/vendeur/analytics`

### 3. **Gestion Stock** (Moyenne priorité)
- `/api/vendeur/gestion-stock`

### 4. **Champs Formulaire Catégorie** (Basse priorité)
- `/api/vendeur/categories/{id}/form-fields`

## ✅ **Endpoints probablement déjà implémentés**

La plupart des endpoints CRUD de base semblent déjà être implémentés côté backend. Les principaux manquants sont les **dashboards avec statistiques** et les **analytics**.

## 🔧 **Recommandations**

1. **Prioriser les dashboards** - Ils sont essentiels pour l'expérience utilisateur
2. **Implémenter les analytics vendeur** - Important pour les vendeurs
3. **Vérifier la cohérence des structures de données** entre frontend et backend
4. **Tester tous les endpoints** avec les outils de diagnostic créés