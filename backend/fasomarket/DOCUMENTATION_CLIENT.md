# 📘 Documentation API FasoMarket - Frontend

## 🌐 URL de Base
```
http://localhost:8081
```

---

## 🏪 Endpoints Boutiques Publiques

### GET `/api/public/boutiques`
Récupère la liste de toutes les boutiques actives.

**Réponse:**
```json
[
  {
    "id": "763c6363-1129-4da6-9bdb-dad7b4b54bda",
    "nom": "MaroShop",
    "description": "Vente d'habit de qualité",
    "address": "Pissy, Ouagadougou",
    "phone": "+22665300001",
    "email": null,
    "category": "Mode",
    "logoUrl": null,
    "bannerUrl": null,
    "delivery": false,
    "deliveryFee": 0.00,
    "rating": 0.00,
    "reviewsCount": 0,
    "status": "ACTIVE"
  }
]
```

**Champs Importants:**
- `nom` ✅ - Nom de la boutique (affiché dans les cartes)
- `id` - Identifiant unique
- `category` - Catégorie de la boutique
- `address` - Adresse complète
- `phone` - Numéro de téléphone
- `delivery` - Livraison disponible (true/false)
- `deliveryFee` - Frais de livraison en FCFA

---

### GET `/api/public/boutiques/{id}`
Récupère les détails d'une boutique spécifique.

**Paramètres:**
- `id` (UUID) - Identifiant de la boutique

**Réponse:** Même structure que ci-dessus

---

### GET `/api/public/boutiques/{id}/produits`
Récupère tous les produits d'une boutique.

**Réponse:**
```json
[
  {
    "id": "uuid",
    "nom": "Chemise en coton premium",
    "description": "Chemise élégante en coton 100% naturel",
    "prix": 15000.00,
    "quantiteStock": 50,
    "images": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    "category": "Mode",
    "disponible": true,
    "rating": 0.00,
    "reviewsCount": 0
  }
]
```

---

## 📦 Endpoints Produits Publics

### GET `/api/public/produits`
Liste tous les produits actifs.

**Paramètres Query (optionnels):**
- `page` (int) - Numéro de page (défaut: 0)
- `size` (int) - Taille de page (défaut: 20)
- `categorie` (string) - Filtrer par catégorie
- `prixMin` (double) - Prix minimum
- `prixMax` (double) - Prix maximum
- `q` (string) - Recherche par nom

**Exemple:**
```
GET /api/public/produits?categorie=Mode&prixMin=10000&prixMax=30000
```

---

### GET `/api/public/produits/{id}`
Détails d'un produit spécifique.

**Réponse:**
```json
{
  "id": "uuid",
  "nom": "Chemise en coton premium",
  "description": "Chemise élégante en coton 100% naturel, disponible en plusieurs couleurs",
  "prix": 15000.00,
  "quantiteStock": 50,
  "actif": true,
  "categorie": "Mode",
  "images": "url1,url2,url3",
  "sku": "PRD-123456",
  "disponible": true,
  "note": 0.00,
  "nombreAvis": 0,
  "dateCreation": "2024-01-13T10:00:00",
  "dateModification": "2024-01-13T10:00:00",
  "boutiqueId": "uuid",
  "nomBoutique": "MaroShop"
}
```

**⚠️ Important:** Le champ stock s'appelle `quantiteStock` (pas `stock`)

---

## 🛒 Endpoints Panier (CLIENT)

### Headers Requis
```
X-User-Id: {uuid-du-client}
```

### GET `/api/client/panier`
Récupère le contenu du panier.

**Réponse:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "productName": "Chemise en coton premium",
    "productImage": "https://...",
    "productPrice": 15000.00,
    "quantity": 2,
    "subtotal": 30000.00,
    "createdAt": "2024-01-13T10:00:00"
  }
]
```

---

### POST `/api/client/panier/ajouter`
Ajoute un produit au panier.

**Body:**
```json
{
  "produitId": "uuid",
  "quantite": 1
}
```

**Réponse:**
```
"Produit ajouté au panier"
```

---

### DELETE `/api/client/panier/{itemId}`
Supprime un article du panier.

**Réponse:**
```
"Article supprimé du panier"
```

---

### DELETE `/api/client/panier/vider`
Vide complètement le panier.

**Réponse:**
```
"Panier vidé"
```

---

## 🔍 Endpoint Recherche

### GET `/api/public/recherche`
Recherche globale (boutiques, produits, catégories).

**Paramètres:**
- `q` (string, requis) - Terme de recherche
- `type` (string, optionnel) - Type: "produits", "boutiques", "categories"

**Exemple:**
```
GET /api/public/recherche?q=chemise&type=produits
```

**Réponse:**
```json
{
  "produits": [...],
  "boutiques": [...],
  "categories": [...]
}
```

---

## 🗂️ Endpoints Catégories

### GET `/api/public/categories`
Liste toutes les catégories.

**Réponse:**
```json
[
  {
    "id": "uuid",
    "nom": "Mode",
    "description": "Vêtements et accessoires",
    "dateCreation": "2024-01-13T10:00:00"
  }
]
```

---

### GET `/api/public/categories/{id}/produits`
Produits d'une catégorie spécifique.

**Paramètres:**
- `page` (int) - Numéro de page
- `size` (int) - Taille de page

---

## 👤 Endpoints Client Dashboard

### GET `/api/client/dashboard`
Dashboard du client avec statistiques.

**Headers:**
```
X-User-Id: {uuid-du-client}
```

**Réponse:**
```json
{
  "statistiques": {
    "commandesEnCours": 2,
    "commandesTerminees": 5,
    "montantTotalDepense": 125000,
    "notificationsNonLues": 3
  },
  "commandesRecentes": [...],
  "recommandations": [...]
}
```

---

### GET `/api/client/notifications`
Liste des notifications du client.

**Réponse:**
```json
[
  {
    "id": "uuid",
    "titre": "Commande expédiée",
    "message": "Votre commande #123 a été expédiée",
    "isRead": false,
    "createdAt": "2024-01-13T10:00:00"
  }
]
```

---

### GET `/api/client/notifications/compteur`
Nombre de notifications non lues.

**Réponse:**
```json
{
  "count": 3,
  "hasUnread": true
}
```

---

### PUT `/api/client/notifications/{id}/lue`
Marque une notification comme lue.

**Réponse:**
```
"Notification marquée comme lue"
```

---

## 📊 Structure des Données Importantes

### Boutique (BoutiquePublicDTO)
```typescript
interface Boutique {
  id: string;
  nom: string;              // ✅ NOM DE LA BOUTIQUE
  description: string;
  address: string;
  phone: string;
  email: string | null;
  category: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  delivery: boolean;
  deliveryFee: number;
  rating: number;
  reviewsCount: number;
  status: string;
}
```

### Produit
```typescript
interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  quantiteStock: number;    // ⚠️ PAS "stock"
  actif: boolean;
  categorie: string;
  images: string;           // URLs séparées par virgules
  sku: string;
  disponible: boolean;
  note: number;
  nombreAvis: number;
  dateCreation: string;
  dateModification: string;
  boutiqueId: string;
  nomBoutique: string;
}
```

### Article Panier (CartItemDTO)
```typescript
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
}
```

---

## ⚠️ Points d'Attention

### 1. Nom de Boutique
✅ **CORRIGÉ** - Le champ `nom` est maintenant retourné dans `/api/public/boutiques`

### 2. Champ Stock
Le backend retourne `quantiteStock`, pas `stock`:
```typescript
// ✅ Correct
const stock = produit.quantiteStock;

// ❌ Incorrect
const stock = produit.stock;
```

### 3. Images Produits
Les images sont retournées sous forme de string avec URLs séparées par virgules:
```typescript
const images = produit.images.split(',').map(url => url.trim());
```

### 4. Headers Requis
Tous les endpoints CLIENT/VENDOR/ADMIN nécessitent:
```
X-User-Id: {uuid-de-l-utilisateur}
```

### 5. Format Prix
Les prix sont en FCFA (nombre décimal):
```typescript
const prixFormate = `${produit.prix.toLocaleString()} FCFA`;
```

---

## 🔐 Authentification

### POST `/api/auth/connexion`
```json
{
  "telephone": "+22670123456",
  "motDePasse": "password123"
}
```

**Réponse:**
```json
{
  "userId": "uuid",
  "role": "CLIENT",
  "token": "jwt-token",
  "message": "Connexion réussie"
}
```

### POST `/api/auth/inscription-client`
```json
{
  "nomComplet": "Jean Dupont",
  "telephone": "+22670123456",
  "email": "jean@example.com",
  "motDePasse": "password123"
}
```

---

## 🧪 Tests avec cURL

### Récupérer les boutiques
```bash
curl http://localhost:8081/api/public/boutiques
```

### Récupérer un produit
```bash
curl http://localhost:8081/api/public/produits/{id}
```

### Voir le panier
```bash
curl -H "X-User-Id: {uuid}" http://localhost:8081/api/client/panier
```

### Ajouter au panier
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-User-Id: {uuid}" \
  -d '{"produitId":"uuid","quantite":1}' \
  http://localhost:8081/api/client/panier/ajouter
```

---

## 📞 Support

- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **API Docs**: http://localhost:8081/v3/api-docs

---

## ✅ Checklist Frontend

- [ ] Utiliser `nom` pour le nom de boutique
- [ ] Utiliser `quantiteStock` pour le stock produit
- [ ] Parser `images` (split par virgule)
- [ ] Ajouter header `X-User-Id` pour endpoints authentifiés
- [ ] Formater les prix en FCFA
- [ ] Gérer les erreurs 404/500
- [ ] Afficher messages de succès/erreur

---

*Document mis à jour le 14 janvier 2026*
*Version: 1.0.0*
