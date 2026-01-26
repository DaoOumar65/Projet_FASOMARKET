# 🔧 FIX STOCK - Mise à jour et récupération

## ✅ Correction appliquée

Le `ProductService.modifierProduit()` utilise maintenant correctement `setStockQuantity()`.

---

## 🧪 TEST DE MISE À JOUR DU STOCK

### 1. Via API directement (Postman/curl)

```bash
curl -X PUT http://localhost:8081/api/produits/{produitId} \
  -H "Content-Type: application/json" \
  -H "X-User-Id: {vendorUserId}" \
  -d '{
    "quantiteStock": 50
  }'
```

**Réponse attendue:**
```json
{
  "id": "...",
  "nom": "Produit Test",
  "quantiteStock": 50,
  "disponible": true
}
```

### 2. Vérifier dans la base de données

```sql
SELECT id, name, stock_quantity, available, is_active 
FROM products 
WHERE id = 'votre-produit-id';
```

**Doit afficher:**
- `stock_quantity`: 50
- `available`: true (si stock > 0 et is_active = true)

---

## 🔍 DIAGNOSTIC DES PROBLÈMES

### Problème 1: Stock ne se met pas à jour

**Causes possibles:**
1. ❌ Le frontend envoie `stock` au lieu de `quantiteStock`
2. ❌ Le header `X-User-Id` est manquant ou incorrect
3. ❌ L'utilisateur n'est pas propriétaire de la boutique

**Solution:**
```typescript
// Frontend doit envoyer:
const data = {
  quantiteStock: 50  // ✅ BON
  // stock: 50       // ❌ MAUVAIS
}

fetch(`http://localhost:8081/api/produits/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': userId  // ✅ REQUIS
  },
  body: JSON.stringify(data)
})
```

### Problème 2: Stock affiché = 0 ou null

**Causes possibles:**
1. ❌ Le backend retourne `stockQuantity` mais le frontend lit `stock`
2. ❌ La réponse ne contient pas le champ

**Solution:**
```typescript
// Frontend doit lire:
const stock = produit.quantiteStock  // ✅ BON
// const stock = produit.stock        // ❌ MAUVAIS
```

### Problème 3: Stock créé à 0 même si valeur fournie

**Vérifier CreerProduitRequest:**
```java
// Le DTO doit avoir:
private Integer stock;  // Nom du champ dans le DTO

// Et le service doit mapper:
product.setStockQuantity(request.getStock());
```

---

## 📋 CHECKLIST DE VÉRIFICATION

### Backend:
- [ ] `Product.stockQuantity` existe (Integer)
- [ ] `Product.setStockQuantity(Integer)` fonctionne
- [ ] `ProduitResponse.quantiteStock` est rempli
- [ ] `ModifierProduitRequest.quantiteStock` existe
- [ ] `ProductService.modifierProduit()` utilise `setStockQuantity()`

### Frontend:
- [ ] Envoie `quantiteStock` dans le body
- [ ] Lit `produit.quantiteStock` dans la réponse
- [ ] Header `X-User-Id` présent
- [ ] URL correcte: `/api/produits/{id}` (PUT)

### Base de données:
- [ ] Colonne `stock_quantity` existe
- [ ] Type: INTEGER
- [ ] Valeur par défaut: 0
- [ ] NOT NULL

---

## 🚀 REDÉMARRAGE REQUIS

Après la correction:

```bash
# Backend
Ctrl + C
mvn spring-boot:run

# Frontend (si nécessaire)
Ctrl + C
npm run dev
```

---

## ✅ TEST FINAL

1. **Créer un produit avec stock = 100**
2. **Vérifier que la réponse contient `quantiteStock: 100`**
3. **Modifier le stock à 50**
4. **Vérifier que la réponse contient `quantiteStock: 50`**
5. **Récupérer le produit (GET)**
6. **Vérifier que `quantiteStock: 50`**

Si toutes les étapes passent → ✅ Stock fonctionne!
