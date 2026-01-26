# 🔌 SPÉCIFICATIONS API BACKEND - PAGES AJOUTÉES

## 📋 TABLE DES MATIÈRES
1. [Commandes Client](#1-commandes-client)
2. [Commandes Vendeur](#2-commandes-vendeur)
3. [Dashboards](#3-dashboards)
4. [Favoris](#4-favoris)
5. [Adresses](#5-adresses)
6. [Profils](#6-profils)
7. [Notifications](#7-notifications)
8. [Avis Produits](#8-avis-produits)
9. [Analytics](#9-analytics)

---

## 1️⃣ COMMANDES CLIENT

### A. Détails d'une commande
```
GET /api/client/commandes/{id}
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
{
  "id": "cmd-123",
  "numero": "CMD-20240115-001",
  "statut": "EN_PREPARATION",
  "total": 45000,
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "methodePaiement": "MOBILE_MONEY",
  "numeroTelephone": "+22670123456",
  "dateCreation": "2024-01-15T10:30:00",
  "items": [
    {
      "id": "item-1",
      "quantite": 2,
      "prixUnitaire": 15000,
      "produit": {
        "id": "prod-1",
        "nom": "T-shirt Nike",
        "images": ["http://localhost:8080/uploads/produits/image1.jpg"]
      }
    }
  ]
}
```

**Validation:**
- Vérifier que la commande appartient au client (userId)
- Retourner 404 si commande introuvable
- Retourner 403 si commande n'appartient pas au client

---

## 2️⃣ COMMANDES VENDEUR

### A. Liste des commandes vendeur
```
GET /api/vendeur/commandes
Headers: X-User-Id: {vendeurId}
```

**Response 200:**
```json
[
  {
    "id": "cmd-123",
    "numero": "CMD-20240115-001",
    "statut": "EN_ATTENTE",
    "total": 45000,
    "dateCreation": "2024-01-15T10:30:00",
    "client": {
      "nomComplet": "Jean Dupont",
      "telephone": "+22670123456"
    },
    "items": [
      {
        "quantite": 2,
        "produit": {
          "nom": "T-shirt Nike",
          "images": ["http://localhost:8080/uploads/produits/image1.jpg"]
        }
      }
    ]
  }
]
```

**Logique:**
- Retourner uniquement les commandes contenant des produits du vendeur
- Trier par date décroissante (plus récentes en premier)
- Inclure informations client pour contact

### B. Mettre à jour le statut
```
PUT /api/vendeur/commandes/{id}/statut
Headers: X-User-Id: {vendeurId}
Content-Type: application/json
```

**Request:**
```json
{
  "statut": "EN_PREPARATION"
}
```

**Response 200:**
```json
{
  "message": "Statut mis à jour",
  "commande": {
    "id": "cmd-123",
    "statut": "EN_PREPARATION"
  }
}
```

**Statuts valides:**
- `EN_ATTENTE` → `EN_PREPARATION`
- `EN_PREPARATION` → `PRETE`
- `PRETE` → `EN_LIVRAISON`
- `EN_LIVRAISON` → `LIVREE`

**Validation:**
- Vérifier que la commande contient des produits du vendeur
- Valider la transition de statut
- Créer une notification pour le client
- Retourner 400 si transition invalide

---

## 3️⃣ DASHBOARDS

### A. Statistiques Admin
```
GET /api/admin/statistiques
Headers: X-User-Id: {adminId}
```

**Response 200:**
```json
{
  "utilisateurs": 1250,
  "produits": 3420,
  "commandes": 856,
  "boutiques": 145
}
```

**Logique:**
- Compter tous les utilisateurs actifs
- Compter tous les produits (status ACTIVE)
- Compter toutes les commandes
- Compter toutes les boutiques validées

---

## 4️⃣ FAVORIS

### A. Liste des favoris
```
GET /api/client/favoris
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
[
  {
    "id": "prod-123",
    "nom": "iPhone 15 Pro",
    "prix": 850000,
    "images": ["http://localhost:8080/uploads/produits/iphone.jpg"],
    "boutique": {
      "nom": "TechStore BF"
    }
  }
]
```

**Modèle de données:**
```java
@Entity
@Table(name = "favoris")
public class Favori {
    @Id
    @GeneratedValue
    private String id;
    
    @ManyToOne
    private Client client;
    
    @ManyToOne
    private Produit produit;
    
    private LocalDateTime dateAjout;
}
```

### B. Ajouter aux favoris
```
POST /api/client/favoris
Headers: X-User-Id: {clientId}
Content-Type: application/json
```

**Request:**
```json
{
  "produitId": "prod-123"
}
```

**Response 201:**
```json
{
  "message": "Produit ajouté aux favoris",
  "favori": {
    "id": "fav-456",
    "produitId": "prod-123"
  }
}
```

**Validation:**
- Vérifier que le produit existe
- Vérifier que le produit n'est pas déjà en favori
- Retourner 409 si déjà en favori

### C. Supprimer des favoris
```
DELETE /api/client/favoris/{produitId}
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
{
  "message": "Produit retiré des favoris"
}
```

---

## 5️⃣ ADRESSES

### A. Liste des adresses
```
GET /api/client/adresses
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
[
  {
    "id": "adr-123",
    "nom": "Maison",
    "adresse": "Secteur 15, Avenue Kwame Nkrumah, Ouagadougou",
    "telephone": "+22670123456",
    "parDefaut": true
  },
  {
    "id": "adr-124",
    "nom": "Bureau",
    "adresse": "Zone du Bois, Ouagadougou",
    "telephone": "+22670654321",
    "parDefaut": false
  }
]
```

**Modèle de données:**
```java
@Entity
@Table(name = "adresses")
public class Adresse {
    @Id
    @GeneratedValue
    private String id;
    
    @ManyToOne
    private Client client;
    
    private String nom;
    private String adresse;
    private String telephone;
    private Boolean parDefaut;
    
    private LocalDateTime dateCreation;
}
```

### B. Créer une adresse
```
POST /api/client/adresses
Headers: X-User-Id: {clientId}
Content-Type: application/json
```

**Request:**
```json
{
  "nom": "Maison",
  "adresse": "Secteur 15, Avenue Kwame Nkrumah, Ouagadougou",
  "telephone": "+22670123456",
  "parDefaut": true
}
```

**Response 201:**
```json
{
  "id": "adr-123",
  "nom": "Maison",
  "adresse": "Secteur 15, Avenue Kwame Nkrumah, Ouagadougou",
  "telephone": "+22670123456",
  "parDefaut": true
}
```

**Logique:**
- Si `parDefaut: true`, mettre toutes les autres adresses à `false`
- Si c'est la première adresse, la définir automatiquement comme par défaut
- Valider le format du téléphone

**Validation:**
- `nom`: requis, 3-50 caractères
- `adresse`: requis, 10-200 caractères
- `telephone`: requis, format international (+226...)

### C. Supprimer une adresse
```
DELETE /api/client/adresses/{id}
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
{
  "message": "Adresse supprimée"
}
```

**Validation:**
- Vérifier que l'adresse appartient au client
- Si adresse par défaut, définir une autre adresse comme par défaut
- Retourner 400 si c'est la seule adresse et qu'il y a des commandes en cours

---

## 6️⃣ PROFILS

### A. Profil Client - Récupérer
```
GET /api/client/profil
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
{
  "nomComplet": "Jean Dupont",
  "email": "jean@example.com",
  "telephone": "+22670123456"
}
```

### B. Profil Client - Mettre à jour
```
PUT /api/client/profil
Headers: X-User-Id: {clientId}
Content-Type: application/json
```

**Request:**
```json
{
  "nomComplet": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "telephone": "+22670123456"
}
```

**Response 200:**
```json
{
  "message": "Profil mis à jour",
  "profil": {
    "nomComplet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "telephone": "+22670123456"
  }
}
```

**Validation:**
- Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
- Vérifier que le téléphone n'est pas déjà utilisé
- Valider le format email et téléphone

### C. Profil Vendeur - Récupérer
```
GET /api/vendeur/profil
Headers: X-User-Id: {vendeurId}
```

**Response 200:**
```json
{
  "nomComplet": "Marie Kaboré",
  "telephone": "+22670123456",
  "carteIdentite": "BF123456789"
}
```

### D. Changer mot de passe
```
PUT /api/auth/changer-mot-de-passe
Headers: X-User-Id: {userId}
Content-Type: application/json
```

**Request:**
```json
{
  "ancienMotDePasse": "oldpass123",
  "nouveauMotDePasse": "newpass456"
}
```

**Response 200:**
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

**Validation:**
- Vérifier que l'ancien mot de passe est correct
- Nouveau mot de passe: min 8 caractères, 1 majuscule, 1 chiffre
- Hasher le nouveau mot de passe avec BCrypt
- Retourner 400 si ancien mot de passe incorrect

---

## 7️⃣ NOTIFICATIONS

### A. Liste des notifications
```
GET /api/notifications
Headers: X-User-Id: {userId}
```

**Response 200:**
```json
[
  {
    "id": "notif-123",
    "titre": "Nouvelle commande",
    "message": "Vous avez reçu une nouvelle commande #CMD-001",
    "type": "COMMANDE",
    "lu": false,
    "dateCreation": "2024-01-15T10:30:00"
  },
  {
    "id": "notif-124",
    "titre": "Produit en rupture",
    "message": "Le produit 'iPhone 15' est en rupture de stock",
    "type": "PRODUIT",
    "lu": true,
    "dateCreation": "2024-01-14T15:20:00"
  }
]
```

**Modèle de données:**
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue
    private String id;
    
    @ManyToOne
    private Utilisateur utilisateur;
    
    private String titre;
    private String message;
    
    @Enumerated(EnumType.STRING)
    private TypeNotification type; // COMMANDE, PRODUIT, PAIEMENT, SYSTEME
    
    private Boolean lu = false;
    private LocalDateTime dateCreation;
}
```

**Logique:**
- Trier par date décroissante
- Retourner uniquement les notifications de l'utilisateur

### B. Marquer comme lu
```
PUT /api/notifications/{id}/lire
Headers: X-User-Id: {userId}
```

**Response 200:**
```json
{
  "message": "Notification marquée comme lue"
}
```

### C. Tout marquer comme lu
```
PUT /api/notifications/lire-tout
Headers: X-User-Id: {userId}
```

**Response 200:**
```json
{
  "message": "Toutes les notifications ont été marquées comme lues",
  "count": 15
}
```

### D. Supprimer une notification
```
DELETE /api/notifications/{id}
Headers: X-User-Id: {userId}
```

**Response 200:**
```json
{
  "message": "Notification supprimée"
}
```

**Validation:**
- Vérifier que la notification appartient à l'utilisateur

### E. Créer des notifications (Système)

**Événements déclencheurs:**

1. **Nouvelle commande (Client → Vendeur):**
```java
notificationService.creer(
    vendeurId,
    "Nouvelle commande",
    "Vous avez reçu une nouvelle commande #" + commande.getNumero(),
    TypeNotification.COMMANDE
);
```

2. **Changement statut (Vendeur → Client):**
```java
notificationService.creer(
    clientId,
    "Commande mise à jour",
    "Votre commande #" + commande.getNumero() + " est " + statut,
    TypeNotification.COMMANDE
);
```

3. **Stock faible (Système → Vendeur):**
```java
notificationService.creer(
    vendeurId,
    "Stock faible",
    "Le produit '" + produit.getNom() + "' a un stock faible (" + stock + ")",
    TypeNotification.PRODUIT
);
```

---

## 8️⃣ AVIS PRODUITS

### A. Liste des avis d'un produit
```
GET /api/public/produits/{id}/avis
```

**Response 200:**
```json
[
  {
    "id": "avis-123",
    "note": 5,
    "commentaire": "Excellent produit, très satisfait !",
    "dateCreation": "2024-01-15T10:30:00",
    "client": {
      "nomComplet": "Jean Dupont"
    }
  },
  {
    "id": "avis-124",
    "note": 4,
    "commentaire": "Bon produit mais livraison un peu lente",
    "dateCreation": "2024-01-14T15:20:00",
    "client": {
      "nomComplet": "Marie Kaboré"
    }
  }
]
```

**Modèle de données:**
```java
@Entity
@Table(name = "avis")
public class Avis {
    @Id
    @GeneratedValue
    private String id;
    
    @ManyToOne
    private Produit produit;
    
    @ManyToOne
    private Client client;
    
    private Integer note; // 1-5
    private String commentaire;
    private LocalDateTime dateCreation;
}
```

**Logique:**
- Trier par date décroissante
- Masquer les informations sensibles du client (email, téléphone)

### B. Vérifier si peut évaluer
```
GET /api/client/produits/{id}/peut-evaluer
Headers: X-User-Id: {clientId}
```

**Response 200:**
```json
{
  "peutEvaluer": true,
  "raison": "Vous avez acheté ce produit"
}
```

**OU**

```json
{
  "peutEvaluer": false,
  "raison": "Vous devez acheter ce produit pour l'évaluer"
}
```

**Logique:**
- Vérifier si le client a une commande LIVREE contenant ce produit
- Vérifier si le client n'a pas déjà laissé un avis

### C. Ajouter un avis
```
POST /api/client/produits/{id}/avis
Headers: X-User-Id: {clientId}
Content-Type: application/json
```

**Request:**
```json
{
  "note": 5,
  "commentaire": "Excellent produit, très satisfait !"
}
```

**Response 201:**
```json
{
  "id": "avis-123",
  "note": 5,
  "commentaire": "Excellent produit, très satisfait !",
  "dateCreation": "2024-01-15T10:30:00"
}
```

**Validation:**
- `note`: requis, entre 1 et 5
- `commentaire`: requis, 10-500 caractères
- Vérifier que le client a acheté le produit
- Vérifier qu'il n'a pas déjà laissé un avis
- Retourner 400 si conditions non remplies

**Logique post-création:**
- Recalculer la note moyenne du produit
- Créer une notification pour le vendeur

---

## 9️⃣ ANALYTICS

### A. Analytics Vendeur
```
GET /api/vendeur/analytics?periode={periode}
Headers: X-User-Id: {vendeurId}
```

**Paramètres:**
- `periode`: `7j`, `30j`, `90j`, `1an`

**Response 200:**
```json
{
  "ventesParMois": [
    { "mois": "Janvier 2024", "total": 450000 },
    { "mois": "Décembre 2023", "total": 380000 },
    { "mois": "Novembre 2023", "total": 520000 }
  ],
  "produitsPopulaires": [
    {
      "nom": "iPhone 15 Pro",
      "ventes": 25,
      "revenus": 850000
    },
    {
      "nom": "Samsung Galaxy S24",
      "ventes": 18,
      "revenus": 720000
    }
  ],
  "statistiques": {
    "ventesTotales": 143,
    "revenuTotal": 5420000,
    "commandesTotales": 89,
    "tauxConversion": 12.5
  }
}
```

**Logique de calcul:**

1. **Ventes par mois:**
```java
// Grouper les commandes LIVREE par mois
SELECT 
    DATE_FORMAT(date_creation, '%Y-%m') as mois,
    SUM(total) as total
FROM commandes
WHERE statut = 'LIVREE'
    AND vendeur_id = :vendeurId
    AND date_creation >= :dateDebut
GROUP BY mois
ORDER BY mois DESC
```

2. **Produits populaires:**
```java
// Top 5 produits par nombre de ventes
SELECT 
    p.nom,
    COUNT(ci.id) as ventes,
    SUM(ci.prix_unitaire * ci.quantite) as revenus
FROM produits p
JOIN commande_items ci ON ci.produit_id = p.id
JOIN commandes c ON c.id = ci.commande_id
WHERE p.vendeur_id = :vendeurId
    AND c.statut = 'LIVREE'
    AND c.date_creation >= :dateDebut
GROUP BY p.id
ORDER BY ventes DESC
LIMIT 5
```

3. **Taux de conversion:**
```java
// (Commandes / Vues produits) * 100
double tauxConversion = (commandesTotales / vuesProduits) * 100;
```

**Périodes:**
- `7j`: Derniers 7 jours
- `30j`: Derniers 30 jours
- `90j`: Derniers 90 jours
- `1an`: Derniers 12 mois

---

## 🔐 SÉCURITÉ & VALIDATION

### Headers requis
```
X-User-Id: {userId}
Content-Type: application/json (pour POST/PUT)
```

### Validation globale
- Vérifier que X-User-Id existe et est valide
- Vérifier les permissions (client/vendeur/admin)
- Valider tous les inputs (XSS, SQL injection)
- Limiter la taille des requêtes (max 10MB)

### Codes d'erreur
- `200`: Succès
- `201`: Créé
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Non autorisé
- `404`: Ressource introuvable
- `409`: Conflit (doublon)
- `500`: Erreur serveur

### Format d'erreur
```json
{
  "error": "Message d'erreur",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 📊 RÉSUMÉ DES ENDPOINTS

### Nouveaux endpoints (13)
1. ✅ `GET /api/client/commandes/{id}` - Détails commande
2. ✅ `PUT /api/vendeur/commandes/{id}/statut` - Mettre à jour statut
3. ✅ `GET /api/admin/statistiques` - Stats admin
4. ✅ `GET /api/client/favoris` - Liste favoris
5. ✅ `POST /api/client/favoris` - Ajouter favori
6. ✅ `DELETE /api/client/favoris/{produitId}` - Supprimer favori
7. ✅ `GET /api/client/adresses` - Liste adresses
8. ✅ `POST /api/client/adresses` - Créer adresse
9. ✅ `DELETE /api/client/adresses/{id}` - Supprimer adresse
10. ✅ `GET /api/client/profil` - Profil client
11. ✅ `PUT /api/client/profil` - Mettre à jour profil
12. ✅ `GET /api/vendeur/profil` - Profil vendeur
13. ✅ `GET /api/notifications` - Liste notifications
14. ✅ `PUT /api/notifications/{id}/lire` - Marquer lu
15. ✅ `PUT /api/notifications/lire-tout` - Tout marquer lu
16. ✅ `DELETE /api/notifications/{id}` - Supprimer notification
17. ✅ `GET /api/public/produits/{id}/avis` - Liste avis
18. ✅ `GET /api/client/produits/{id}/peut-evaluer` - Vérifier droit
19. ✅ `POST /api/client/produits/{id}/avis` - Ajouter avis
20. ✅ `GET /api/vendeur/analytics` - Analytics vendeur

### Endpoints existants utilisés
- `GET /api/client/historique-commandes`
- `GET /api/client/panier`
- `GET /api/vendeur/produits`
- `GET /api/vendeur/commandes`
- `GET /api/vendeur/boutiques`
- `POST /api/vendeur/boutiques/creer`
- `PUT /api/vendeur/boutiques/{id}`
- `PUT /api/auth/changer-mot-de-passe`
- `PUT /api/vendeur/produits/{id}`

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### Phase 1 - Critique (1-2 jours)
1. Favoris (GET, POST, DELETE)
2. Adresses (GET, POST, DELETE)
3. Profils (GET, PUT)
4. Détails commande (GET)
5. Statut commande (PUT)

### Phase 2 - Important (2-3 jours)
6. Notifications (GET, PUT, DELETE)
7. Avis produits (GET, POST)
8. Stats admin (GET)

### Phase 3 - Avancé (3-5 jours)
9. Analytics vendeur (GET)
10. Système de notifications automatiques
11. Calculs statistiques complexes

---

**Total endpoints à implémenter:** 20 nouveaux
**Temps estimé:** 6-10 jours de développement backend
**Base de données:** 4 nouvelles tables (Favori, Adresse, Notification, Avis)
