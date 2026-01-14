# 📱 Guide d'Intégration Frontend - FasoMarket API

## 🌐 Configuration de Base

**URL de Base**: `http://localhost:8081`
**Documentation API**: `http://localhost:8081/swagger-ui.html`
**Base de données H2 Console**: `http://localhost:8081/h2-console`

---

## 🔐 1. SYSTÈME D'AUTHENTIFICATION

### 1.1 Endpoints d'Authentification

#### Connexion
```http
POST /api/auth/connexion
Content-Type: application/json

{
  "telephone": "+22670123456",
  "motDePasse": "monMotDePasse"
}

Response: {
  "token": "jwt_token_here",
  "utilisateur": {
    "id": "uuid",
    "nomComplet": "Jean Dupont",
    "telephone": "+22670123456",
    "email": "jean@example.com",
    "role": "CLIENT|VENDOR|ADMIN"
  }
}
```

#### Inscription Client
```http
POST /api/auth/inscription-client
Content-Type: application/json

{
  "nomComplet": "Jean Dupont",
  "telephone": "+22670123456",
  "email": "jean@example.com",
  "motDePasse": "monMotDePasse"
}
```

#### Inscription Vendeur
```http
POST /api/auth/inscription-vendeur
Content-Type: application/json

{
  "nomComplet": "Marie Commerçante",
  "telephone": "+22670654321",
  "email": "marie@example.com",
  "motDePasse": "monMotDePasse",
  "carteIdentite": "CI123456789"
}
```

#### Changer Mot de Passe
```http
PUT /api/auth/changer-mot-de-passe
Headers: X-User-Id: {userId}
Content-Type: application/json

{
  "ancienMotDePasse": "ancien",
  "nouveauMotDePasse": "nouveau"
}
```

### 1.2 Gestion des Sessions Frontend
- **Stockage du Token**: LocalStorage ou SessionStorage
- **Header d'Authentification**: `X-User-Id: {userId}` pour toutes les requêtes authentifiées
- **Redirection**: Selon le rôle après connexion (CLIENT → Dashboard Client, VENDOR → Dashboard Vendeur, ADMIN → Dashboard Admin)

---

## 🏠 2. INTERFACE PUBLIQUE (Sans Authentification)

### 2.1 Page d'Accueil
```http
GET /api/public/accueil

Response: {
  "categoriesPopulaires": [...],
  "boutiquesVedettes": [...],
  "produitsEnVedette": [...],
  "statistiques": {
    "nombreBoutiques": 150,
    "nombreProduits": 2500,
    "nombreClients": 1200
  }
}
```

### 2.2 Recherche Globale
```http
GET /api/public/recherche?q={terme}&type={boutiques|produits|categories}

Response: {
  "boutiques": [...],
  "produits": [...],
  "categories": [...]
}
```

### 2.3 Navigation par Catégories
```http
GET /api/public/categories

GET /api/public/categories/{id}/vitrine

Response: {
  "categorie": {...},
  "boutiques": [...],
  "produits": [...]
}
```

### 2.4 Détails Boutique (Public)
```http
GET /api/public/boutiques/{id}

GET /api/public/boutiques/{id}/produits
```

### 2.5 Détails Produit (Public)
```http
GET /api/public/produits/{id}

Response: {
  "id": "uuid",
  "nom": "Produit",
  "description": "...",
  "prix": 15000,
  "images": ["url1", "url2"],
  "boutique": {...},
  "disponible": true,
  "quantiteStock": 50
}
```

---

## 👤 3. INTERFACE CLIENT

### 3.1 Dashboard Client
```http
GET /api/client/dashboard
Headers: X-User-Id: {clientId}

Response: {
  "statistiques": {
    "commandesEnCours": 2,
    "commandesTerminees": 15,
    "montantTotalDepense": 450000,
    "notificationsNonLues": 3
  },
  "commandesRecentes": [...],
  "recommandations": [...]
}
```

### 3.2 Profil Client
```http
GET /api/client/profil
Headers: X-User-Id: {clientId}

PUT /api/client/profil
Headers: X-User-Id: {clientId}
Content-Type: application/json

{
  "nomComplet": "Jean Dupont",
  "email": "jean@example.com",
  "adresse": "Secteur 15, Ouagadougou"
}
```

### 3.3 Gestion du Panier
```http
POST /api/client/panier/ajouter
Headers: X-User-Id: {clientId}
Content-Type: application/json

{
  "produitId": "uuid",
  "quantite": 2
}

GET /api/client/panier
Headers: X-User-Id: {clientId}

DELETE /api/client/panier/{itemId}
Headers: X-User-Id: {clientId}

DELETE /api/client/panier/vider
Headers: X-User-Id: {clientId}
```

### 3.4 Gestion des Commandes
```http
POST /api/client/commandes/creer
Headers: X-User-Id: {clientId}
Content-Type: application/json

{
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "methodePaiement": "MOBILE_MONEY",
  "numeroTelephone": "+22670123456"
}

GET /api/client/historique-commandes
Headers: X-User-Id: {clientId}

GET /api/client/commandes/{id}
Headers: X-User-Id: {clientId}
```

### 3.5 Paiements
```http
POST /api/client/paiements/payer
Headers: X-User-Id: {clientId}
Content-Type: application/json

{
  "commandeId": "uuid",
  "methodePaiement": "MOBILE_MONEY",
  "numeroTelephone": "+22670123456"
}
```

### 3.6 Notifications Client
```http
GET /api/client/notifications
Headers: X-User-Id: {clientId}

GET /api/client/notifications/compteur
Headers: X-User-Id: {clientId}

PUT /api/client/notifications/{id}/lue
Headers: X-User-Id: {clientId}
```

---

## 🏪 4. INTERFACE VENDEUR

### 4.1 Dashboard Vendeur
```http
GET /api/vendeur/dashboard
Headers: X-User-Id: {vendorId}

Response: {
  "statistiques": {
    "nombreBoutiques": 2,
    "nombreProduits": 45,
    "commandesEnAttente": 8,
    "notificationsNonLues": 5
  },
  "boutiques": [...],
  "commandesRecentes": [...],
  "produitsRecents": [...]
}
```

### 4.2 Analytics Vendeur
```http
GET /api/vendeur/analytics
Headers: X-User-Id: {vendorId}

Response: {
  "totalCommandes": 150,
  "revenuTotal": 2500000,
  "produitsPlusVendus": [...]
}
```

### 4.3 Gestion des Boutiques
```http
POST /api/vendeur/boutiques/creer
Headers: X-User-Id: {vendorId}
Content-Type: application/json

{
  "nom": "Ma Boutique",
  "description": "Description de ma boutique",
  "telephone": "+22670654321",
  "adresse": "Secteur 15, Ouagadougou",
  "email": "contact@boutique.com",
  "categorie": "Alimentaire",
  "livraison": true,
  "fraisLivraison": 1000
}

GET /api/vendeur/boutiques
Headers: X-User-Id: {vendorId}

PUT /api/vendeur/boutiques/{id}
Headers: X-User-Id: {vendorId}

GET /api/vendeur/boutiques/rechercher?q={terme}
Headers: X-User-Id: {vendorId}
```

### 4.4 Gestion des Produits
```http
POST /api/vendeur/produits/creer
Headers: X-User-Id: {vendorId}
Content-Type: application/json

{
  "boutiqueId": "uuid",
  "nom": "Mon Produit",
  "description": "Description du produit",
  "categorie": "Alimentaire",
  "prix": 15000,
  "quantiteStock": 100,
  "images": ["url1", "url2"],
  "poids": 1.5,
  "dimensions": "10x10x5"
}

GET /api/vendeur/produits
Headers: X-User-Id: {vendorId}

PUT /api/vendeur/produits/{id}
Headers: X-User-Id: {vendorId}

GET /api/vendeur/produits/rechercher?q={terme}
Headers: X-User-Id: {vendorId}
```

### 4.5 Gestion du Stock
```http
GET /api/vendeur/gestion-stock
Headers: X-User-Id: {vendorId}

Response: {
  "produits": [...],
  "produitsEnRupture": [...],
  "produitsStockFaible": [...]
}
```

### 4.6 Gestion des Commandes Vendeur
```http
GET /api/vendeur/commandes
Headers: X-User-Id: {vendorId}

PUT /api/vendeur/commandes/{id}/statut
Headers: X-User-Id: {vendorId}
Content-Type: application/x-www-form-urlencoded

statut=CONFIRMED|PREPARING|SHIPPED|DELIVERED
```

### 4.7 Notifications Vendeur
```http
GET /api/vendeur/notifications
Headers: X-User-Id: {vendorId}

PUT /api/vendeur/notifications/{id}/lue
Headers: X-User-Id: {vendorId}
```

---

## ⚙️ 5. INTERFACE ADMIN

### 5.1 Dashboard Admin
```http
GET /api/admin/dashboard
Headers: X-User-Id: {adminId}

Response: {
  "statistiques": {
    "totalUtilisateurs": 1500,
    "totalClients": 1200,
    "totalVendeurs": 250,
    "totalBoutiques": 180,
    "totalProduits": 2500,
    "totalCommandes": 5000,
    "vendeursEnAttente": 15
  },
  "vendeursEnAttente": [...],
  "commandesRecentes": [...]
}
```

### 5.2 Gestion des Utilisateurs
```http
GET /api/admin/utilisateurs?role={CLIENT|VENDOR|ADMIN}&page=0&size=20
Headers: X-User-Id: {adminId}
```

### 5.3 Validation des Vendeurs
```http
GET /api/admin/validations
Headers: X-User-Id: {adminId}

PUT /api/admin/vendeurs/{vendorId}/valider
Headers: X-User-Id: {adminId}
Content-Type: application/x-www-form-urlencoded

statut=APPROVED|REJECTED&raison=Raison du rejet
```

### 5.4 Gestion des Catégories
```http
POST /api/admin/categories/creer
Headers: X-User-Id: {adminId}
Content-Type: application/json

{
  "nom": "Nouvelle Catégorie",
  "description": "Description de la catégorie",
  "icone": "icon-name"
}

GET /api/admin/categories
Headers: X-User-Id: {adminId}
```

### 5.5 Gestion des Boutiques (Admin)
```http
GET /api/admin/boutiques
Headers: X-User-Id: {adminId}

PUT /api/admin/boutiques/{id}/statut
Headers: X-User-Id: {adminId}
Content-Type: application/x-www-form-urlencoded

statut=ACTIVE|SUSPENDED|REJECTED
```

### 5.6 Gestion des Commandes (Admin)
```http
GET /api/admin/commandes
Headers: X-User-Id: {adminId}

PUT /api/admin/commandes/{id}/statut
Headers: X-User-Id: {adminId}
Content-Type: application/x-www-form-urlencoded

statut=PENDING|CONFIRMED|PREPARING|SHIPPED|DELIVERED|CANCELLED
```

### 5.7 Notifications Admin
```http
POST /api/admin/notifications/diffuser
Headers: X-User-Id: {adminId}
Content-Type: application/x-www-form-urlencoded

titre=Titre de la notification&message=Message à diffuser
```

### 5.8 Statistiques et Revenus
```http
GET /api/admin/statistiques/revenus
Headers: X-User-Id: {adminId}

GET /api/admin/paiements
Headers: X-User-Id: {adminId}
```

---

## 📱 6. FONCTIONNALITÉS FRONTEND À IMPLÉMENTER

### 6.1 Pages Publiques
- **Page d'Accueil**: Carrousel, catégories, boutiques vedettes, produits en vedette
- **Page de Recherche**: Filtres par catégorie, prix, localisation
- **Page Catégorie**: Liste des boutiques et produits par catégorie
- **Page Boutique**: Profil boutique, liste des produits, avis
- **Page Produit**: Détails, images, avis, bouton "Ajouter au panier"
- **Page de Connexion/Inscription**: Formulaires avec validation

### 6.2 Interface Client
- **Dashboard Client**: Statistiques, commandes récentes, recommandations
- **Profil Client**: Modification des informations personnelles
- **Panier**: Gestion des articles, calcul du total, validation
- **Commandes**: Historique, suivi des commandes, détails
- **Paiement**: Interface Mobile Money, confirmation
- **Notifications**: Centre de notifications avec compteur

### 6.3 Interface Vendeur
- **Dashboard Vendeur**: Vue d'ensemble des activités
- **Gestion Boutiques**: CRUD boutiques, statuts, paramètres
- **Gestion Produits**: CRUD produits, upload d'images, gestion stock
- **Commandes Vendeur**: Liste, changement de statut, détails
- **Analytics**: Graphiques de ventes, produits populaires
- **Notifications**: Alertes commandes, validations

### 6.4 Interface Admin
- **Dashboard Admin**: Statistiques globales, activités récentes
- **Gestion Utilisateurs**: Liste, filtres, actions
- **Validation Vendeurs**: Interface d'approbation/rejet
- **Gestion Catégories**: CRUD catégories avec icônes
- **Modération**: Boutiques et produits à valider
- **Statistiques**: Graphiques revenus, utilisateurs actifs

---

## 🔧 7. CONFIGURATIONS TECHNIQUES

### 7.1 Gestion des États
```javascript
// États globaux à gérer
const appState = {
  user: null,
  token: null,
  cart: [],
  notifications: [],
  isLoading: false,
  error: null
}
```

### 7.2 Intercepteurs HTTP
```javascript
// Ajouter automatiquement le header X-User-Id
axios.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
});
```

### 7.3 Gestion des Erreurs
```javascript
// Gestion centralisée des erreurs API
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Rediriger vers login
    logout();
  } else if (error.response?.status === 403) {
    // Accès refusé
    showError('Accès refusé');
  }
};
```

### 7.4 Validation des Formulaires
- **Téléphone**: Format burkinabé (+226XXXXXXXX)
- **Email**: Validation RFC standard
- **Mots de passe**: Minimum 8 caractères
- **Prix**: Nombres positifs uniquement
- **Images**: Formats JPG, PNG, taille max 5MB

---

## 🎨 8. ÉLÉMENTS UI/UX SPÉCIFIQUES

### 8.1 Composants Réutilisables
- **ProductCard**: Affichage produit avec image, prix, boutique
- **ShopCard**: Carte boutique avec logo, nom, note
- **OrderStatus**: Badge de statut avec couleurs
- **NotificationBadge**: Compteur de notifications
- **LoadingSpinner**: Indicateur de chargement
- **ErrorMessage**: Affichage d'erreurs
- **SuccessMessage**: Confirmations d'actions

### 8.2 Navigation
- **Menu Principal**: Accueil, Catégories, Boutiques, Recherche
- **Menu Utilisateur**: Profil, Commandes, Panier, Déconnexion
- **Breadcrumb**: Navigation hiérarchique
- **Pagination**: Pour les listes longues

### 8.3 Responsive Design
- **Mobile First**: Optimisé pour smartphones
- **Tablette**: Adaptation pour écrans moyens
- **Desktop**: Interface complète pour ordinateurs

---

## 🔔 9. NOTIFICATIONS EN TEMPS RÉEL

### 9.1 Types de Notifications
- **Client**: Commande confirmée, expédiée, livrée
- **Vendeur**: Nouvelle commande, validation boutique
- **Admin**: Nouveau vendeur, problème système

### 9.2 Implémentation
```javascript
// Polling pour les notifications (alternative à WebSocket)
setInterval(() => {
  fetchNotifications();
}, 30000); // Toutes les 30 secondes
```

---

## 📊 10. ANALYTICS ET SUIVI

### 10.1 Métriques à Suivre
- **Conversions**: Visiteurs → Clients
- **Panier**: Taux d'abandon
- **Recherche**: Termes populaires
- **Performance**: Temps de chargement

### 10.2 Tableaux de Bord
- **Graphiques**: Ventes par période
- **KPIs**: Revenus, commandes, utilisateurs actifs
- **Cartes**: Répartition géographique

---

## 🚀 11. DÉPLOIEMENT ET TESTS

### 11.1 Tests à Implémenter
- **Tests Unitaires**: Composants React/Vue
- **Tests d'Intégration**: API calls
- **Tests E2E**: Parcours utilisateur complets
- **Tests de Performance**: Temps de chargement

### 11.2 Environnements
- **Développement**: `http://localhost:8081`
- **Test**: URL de staging
- **Production**: URL finale

---

## 📋 12. CHECKLIST DE DÉVELOPPEMENT

### Phase 1 - Base
- [ ] Configuration projet frontend
- [ ] Système d'authentification
- [ ] Navigation de base
- [ ] Pages publiques (accueil, recherche)

### Phase 2 - Client
- [ ] Interface client complète
- [ ] Gestion du panier
- [ ] Processus de commande
- [ ] Paiement Mobile Money

### Phase 3 - Vendeur
- [ ] Dashboard vendeur
- [ ] Gestion boutiques et produits
- [ ] Suivi des commandes
- [ ] Analytics de base

### Phase 4 - Admin
- [ ] Interface d'administration
- [ ] Validation des vendeurs
- [ ] Modération du contenu
- [ ] Statistiques avancées

### Phase 5 - Optimisation
- [ ] Performance et SEO
- [ ] Tests complets
- [ ] Documentation utilisateur
- [ ] Déploiement production

---

## 🔗 Ressources Utiles

- **Documentation API**: http://localhost:8081/swagger-ui.html
- **Base de données**: http://localhost:8081/h2-console
- **Postman Collection**: À créer pour les tests
- **Guide de Style**: Définir les couleurs, polices, espacements

Ce guide couvre toutes les fonctionnalités nécessaires pour créer un frontend complet et fonctionnel pour FasoMarket. Chaque endpoint et fonctionnalité a été documenté avec les détails d'implémentation requis.