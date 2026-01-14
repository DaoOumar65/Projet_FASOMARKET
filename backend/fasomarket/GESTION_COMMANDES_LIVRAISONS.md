# 📦 Gestion des Commandes et Livraisons

## ✅ Fonctionnalités Implémentées

### Côté Client
- **POST /api/client/commandes/creer** - Créer commande avec option livraison
  - `adresseLivraison` (requis)
  - `needsDelivery` (boolean) - Si livraison nécessaire
  - `numeroTelephone` (requis) - Pour SMS confirmation

### Côté Vendeur
Les commandes sont automatiquement visibles pour les vendeurs dont les produits sont commandés.

**Endpoints disponibles:**
- **GET /api/vendeur/commandes** - Voir toutes les commandes contenant mes produits
- **PUT /api/vendeur/commandes/{id}/confirmer** - Confirmer la commande
- **PUT /api/vendeur/commandes/{id}/expedier** - Marquer comme expédiée (si livraison)
- **PUT /api/vendeur/commandes/{id}/livrer** - Marquer comme livrée
- **PUT /api/vendeur/commandes/{id}/statut?statut=XXX** - Changer statut manuellement

## 🔄 Flux de Commande

### Sans Livraison
1. Client crée commande (`needsDelivery: false`)
2. Vendeur confirme → `CONFIRMED`
3. Client récupère → Vendeur marque `DELIVERED`

### Avec Livraison
1. Client crée commande (`needsDelivery: true`)
2. Vendeur confirme → `CONFIRMED`
3. Vendeur expédie → `SHIPPED`
4. Livraison effectuée → `DELIVERED`

## 📊 Statuts de Commande

```
PENDING → CONFIRMED → PAID → SHIPPED → DELIVERED
                              ↓
                          CANCELLED
```

## 🗄️ Modèle de Données

### Order
```java
- id: UUID
- client: User
- status: OrderStatus
- totalAmount: BigDecimal
- deliveryAddress: String
- needsDelivery: Boolean
- deliveryPhone: String
- orderItems: List<OrderItem>
- createdAt: LocalDateTime
```

### OrderItem
```java
- id: UUID
- order: Order
- product: Product
- quantity: Integer
- unitPrice: BigDecimal
- totalPrice: BigDecimal
```

## 🚀 Utilisation

### Créer une commande avec livraison
```javascript
POST /api/client/commandes/creer
{
  "adresseLivraison": "Secteur 15, Ouagadougou",
  "needsDelivery": true,
  "numeroTelephone": "+22670123456"
}
```

### Vendeur confirme la commande
```javascript
PUT /api/vendeur/commandes/{commandeId}/confirmer
```

### Vendeur expédie (si livraison)
```javascript
PUT /api/vendeur/commandes/{commandeId}/expedier
```

### Vendeur marque comme livrée
```javascript
PUT /api/vendeur/commandes/{commandeId}/livrer
```

## 📝 Migration Base de Données

Fichier créé: `V3__add_delivery_fields.sql`
- Ajoute `needs_delivery` (BOOLEAN)
- Ajoute `delivery_phone` (VARCHAR)

**Redémarrer le backend pour appliquer la migration.**
