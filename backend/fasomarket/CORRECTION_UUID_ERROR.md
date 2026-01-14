# 🔧 Correction Erreur UUID

## ❌ Problème Identifié
```
Failed to convert value of type 'java.lang.String' to required type 'java.util.UUID'; Invalid UUID string: 1
```

Le frontend envoie "1" au lieu d'un UUID valide.

## ✅ Solutions

### 1. Frontend - Utiliser de Vrais UUIDs
```typescript
// ❌ INCORRECT - ID numérique
const categoryId = 1;
const response = await api.get(`/api/categories/${categoryId}`);

// ✅ CORRECT - UUID valide
const categoryId = "e3918d7d-c850-4f1f-9a08-b27c344050cd";
const response = await api.get(`/api/categories/${categoryId}`);
```

### 2. Backend - Validation UUID (Optionnel)
```java
@GetMapping("/{id}")
public ResponseEntity<?> getById(@PathVariable String id) {
    try {
        UUID uuid = UUID.fromString(id);
        // Continuer avec uuid...
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("ID invalide: doit être un UUID");
    }
}
```

### 3. Frontend - Récupérer les Vrais IDs
```typescript
// Récupérer les catégories avec leurs vrais UUIDs
const fetchCategories = async () => {
  const response = await api.get('/api/categories');
  const categories = response.data;
  
  // Utiliser les vrais UUIDs
  categories.forEach(cat => {
    console.log(`Catégorie: ${cat.nom}, ID: ${cat.id}`);
  });
};
```

## 🧪 UUIDs de Test Valides

```javascript
// Exemples d'UUIDs valides pour les tests
const validUUIDs = {
  category: "e3918d7d-c850-4f1f-9a08-b27c344050cd",
  user: "25e39c54-0c5f-4059-b12e-3de8005b1903",
  shop: "a486090e-b015-492f-ac3e-fd1508530d26",
  product: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
};
```

## 🔍 Identifier l'Endpoint Problématique

L'erreur vient probablement de :
- `/api/categories/{id}`
- `/api/boutiques/{id}`
- `/api/produits/{id}`
- `/api/admin/utilisateurs/{id}`

## 🎯 Actions Immédiates

1. **Vérifier les appels frontend** qui utilisent des IDs numériques
2. **Remplacer par des UUIDs** valides
3. **Tester avec des UUIDs** réels de la base de données

## 📋 Commandes de Test

```bash
# Récupérer les vrais UUIDs des catégories
curl -X GET "http://localhost:8081/api/categories" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Utiliser un vrai UUID
curl -X GET "http://localhost:8081/api/categories/e3918d7d-c850-4f1f-9a08-b27c344050cd" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```