# 🛒 FasoMarket API - Authentification Multi-Rôles

API d'authentification pour FasoMarket avec gestion des rôles CLIENT, VENDOR et ADMIN.

## 🚀 Démarrage rapide

### Prérequis
- Java 21
- PostgreSQL
- Maven

### Installation

1. **Configurer PostgreSQL**
```sql
-- Créer la base de données
CREATE DATABASE fasomarket;
-- Optionnel: exécuter init.sql pour l'admin par défaut
```

2. **Configurer application.properties**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/fasomarket
spring.datasource.username=votre_username
spring.datasource.password=votre_password
```

3. **Lancer l'application**
```bash
mvn spring-boot:run
```

## 📚 Documentation API

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## 🔗 Endpoints (en français)

### Interface Publique

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/public/accueil` | Données page d'accueil |
| GET | `/api/public/recherche` | Recherche globale |
| GET | `/api/public/categories/{id}/vitrine` | Vitrine catégorie |
| GET | `/api/public/boutiques/{id}` | Détails boutique |
| GET | `/api/public/boutiques/{id}/produits` | Produits d'une boutique |
| GET | `/api/public/produits/{id}` | Détails produit |
| GET | `/api/public/categories` | Liste catégories |

### Interface Client

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/client/dashboard` | Dashboard client |
| GET | `/api/client/profil` | Profil client |
| GET | `/api/client/historique-commandes` | Historique complet |
| POST | `/api/client/panier/ajouter` | Ajouter au panier |
| GET | `/api/client/panier` | Voir le panier |
| DELETE | `/api/client/panier/{itemId}` | Supprimer du panier |
| POST | `/api/client/commandes/creer` | Créer commande |
| GET | `/api/client/commandes/{id}` | Détails commande |
| POST | `/api/client/paiements/payer` | Payer commande |
| GET | `/api/client/notifications` | Mes notifications |
| GET | `/api/client/notifications/compteur` | Compteur notifications |
| PUT | `/api/client/notifications/{id}/lue` | Marquer notification lue |

### Interface Vendeur

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/vendeur/dashboard` | Dashboard vendeur |
| GET | `/api/vendeur/analytics` | Analytics ventes |
| GET | `/api/vendeur/gestion-stock` | Gestion du stock |
| POST | `/api/vendeur/boutiques/creer` | Créer boutique |
| GET | `/api/vendeur/boutiques` | Mes boutiques |
| PUT | `/api/vendeur/boutiques/{id}` | Modifier boutique |
| GET | `/api/vendeur/boutiques/rechercher` | Rechercher mes boutiques |
| POST | `/api/vendeur/produits/creer` | Créer produit |
| GET | `/api/vendeur/produits` | Mes produits |
| PUT | `/api/vendeur/produits/{id}` | Modifier produit |
| GET | `/api/vendeur/produits/rechercher` | Rechercher mes produits |
| GET | `/api/vendeur/commandes` | Mes commandes |
| PUT | `/api/vendeur/commandes/{id}/statut` | Changer statut commande |
| GET | `/api/vendeur/notifications` | Mes notifications |
| PUT | `/api/vendeur/notifications/{id}/lue` | Marquer notification lue |

### Interface Admin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard admin |
| GET | `/api/admin/utilisateurs` | Gestion utilisateurs |
| GET | `/api/admin/validations` | Validations en attente |
| PUT | `/api/admin/vendeurs/{id}/valider` | Valider vendeur |
| POST | `/api/admin/categories/creer` | Créer catégorie |
| GET | `/api/admin/categories` | Gestion catégories |
| GET | `/api/admin/boutiques` | Gestion boutiques |
| PUT | `/api/admin/boutiques/{id}/statut` | Changer statut boutique |
| GET | `/api/admin/commandes` | Gestion commandes |
| PUT | `/api/admin/commandes/{id}/statut` | Changer statut commande |
| GET | `/api/admin/paiements` | Gestion paiements |
| POST | `/api/admin/notifications/diffuser` | Diffuser notification |
| GET | `/api/admin/statistiques/revenus` | Statistiques revenus |

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/connexion` | Connexion utilisateur |
| POST | `/api/auth/inscription-client` | Inscription client |
| POST | `/api/auth/inscription-vendeur` | Inscription vendeur |
| GET | `/api/auth/profil` | Obtenir le profil |

### Catégories

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/categories/creer` | Créer une catégorie |
| GET | `/api/categories` | Lister les catégories |
| GET | `/api/categories/{id}` | Détails d'une catégorie |
| GET | `/api/categories/{id}/boutiques` | Boutiques par catégorie |
| GET | `/api/categories/{id}/produits` | Produits par catégorie |

### Boutiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/boutiques/creer` | Créer une boutique (vendeur) |
| GET | `/api/boutiques/mes-boutiques` | Mes boutiques (vendeur) |
| GET | `/api/boutiques/actives` | Boutiques actives (public) |
| GET | `/api/boutiques/{id}` | Détails d'une boutique |
| PUT | `/api/boutiques/{id}` | Modifier une boutique (vendeur) |
| DELETE | `/api/boutiques/{id}` | Supprimer une boutique (vendeur) |
### Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/produits/creer` | Créer un produit (vendeur) |
| GET | `/api/produits/mes-produits` | Mes produits (vendeur) |
| GET | `/api/produits/actifs` | Produits actifs (public) |
| GET | `/api/produits/boutique/{id}` | Produits d'une boutique |
| GET | `/api/produits/{id}` | Détails d'un produit |
| PUT | `/api/produits/{id}` | Modifier un produit (vendeur) |
| GET | `/api/boutiques/rechercher` | Rechercher des boutiques |
| GET | `/api/produits/rechercher` | Rechercher des produits |
### Panier

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/panier/ajouter` | Ajouter un produit au panier |
| GET | `/api/panier` | Voir le contenu du panier |
| DELETE | `/api/panier/{itemId}` | Supprimer un article du panier |
| DELETE | `/api/panier/vider` | Vider le panier |

### Commandes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/commandes/creer` | Créer une commande depuis le panier |
| GET | `/api/commandes/mes-commandes` | Mes commandes (client) |
| GET | `/api/commandes/vendeur/mes-commandes` | Mes commandes (vendeur) |
| GET | `/api/commandes/vendeur/par-statut` | Commandes vendeur par statut |
| GET | `/api/commandes/{id}` | Détails d'une commande |
| PUT | `/api/commandes/{id}/statut` | Changer le statut (admin) |
### Paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/paiements/payer` | Payer une commande |

### Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Mes notifications |
| GET | `/api/notifications/non-lues` | Notifications non lues |
| GET | `/api/notifications/compteur` | Nombre de notifications non lues |
| PUT | `/api/notifications/{id}/lue` | Marquer comme lue |
| PUT | `/api/notifications/toutes-lues` | Marquer toutes comme lues |

### Exemples de requêtes

#### Connexion
```json
POST /api/auth/connexion
{
  "telephone": "+22670123456",
  "motDePasse": "monMotDePasse"
}
```

#### Inscription Client
```json
POST /api/auth/inscription-client
{
  "nomComplet": "Jean Dupont",
  "telephone": "+22670123456",
  "email": "jean@example.com",
  "motDePasse": "monMotDePasse"
}
```

#### Inscription Vendeur
```json
POST /api/auth/inscription-vendeur
{
  "nomComplet": "Marie Commerçante",
  "telephone": "+22670654321",
  "email": "marie@example.com",
  "motDePasse": "monMotDePasse",
  "carteIdentite": "CI123456789"
}
```

#### Créer une Boutique
```json
POST /api/boutiques/creer
Headers: X-User-Id: {vendorUserId}
{
  "nom": "Boutique de Marie",
  "description": "Vente de produits locaux",
  "telephone": "+22670654321",
  "adresse": "Secteur 15, Ouagadougou",
  "email": "contact@boutique.com",
  "categorie": "Alimentaire",
  "livraison": true,
  "fraisLivraison": 1000
}
```

## 🏗️ Architecture

### Table centrale `users`
Tous les acteurs (client, vendeur, admin) utilisent la même table avec différenciation par le champ `role`.

### Spécificités par rôle
- **CLIENT**: Accès direct après inscription
- **VENDOR**: Inscription + validation admin requise (table `vendors`)
- **ADMIN**: Gestion complète du système

## 🔐 Sécurité

- Mots de passe hashés avec BCrypt
- JWT pour l'authentification
- Validation des données d'entrée
- Sessions stateless

## 🛠️ Technologies

- Spring Boot 4.0.1
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (jsonwebtoken)
- Swagger/OpenAPI 3