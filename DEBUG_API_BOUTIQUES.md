# 🧪 Test API Boutiques - Debug

## Test Direct de l'API

### 1. Test avec cURL
```bash
curl -X GET http://localhost:8081/api/public/boutiques
```

### 2. Test avec JavaScript (Console navigateur)
```javascript
fetch('http://localhost:8081/api/public/boutiques')
  .then(response => response.json())
  .then(data => {
    console.log('Réponse API:', data);
    if (data && data.length > 0) {
      console.log('Première boutique:', data[0]);
      console.log('Champs disponibles:', Object.keys(data[0]));
      console.log('Nom de la boutique:', data[0].nom);
    }
  })
  .catch(error => console.error('Erreur:', error));
```

## 🔍 Problèmes Possibles

### 1. Le champ `nom` est `null` ou `undefined`
**Solution:** Vérifier la base de données
```sql
SELECT id, nom, description FROM boutiques WHERE statut = 'ACTIVE';
```

### 2. Le backend ne mappe pas le champ `nom`
**Solution:** Vérifier le DTO et le Service backend

### 3. Le champ s'appelle différemment
**Possibilités:** `name`, `title`, `shopName`, `boutiqueName`

## 🚨 Fix Temporaire Frontend

Si le backend ne peut pas être corrigé immédiatement, utiliser ce mapping :

```typescript
const boutiquesFormatees = (response.data || []).map((boutique: any) => ({
  id: boutique.id,
  nom: boutique.nom || boutique.name || boutique.title || 
       boutique.shopName || boutique.boutiqueName || 
       `Boutique ${boutique.id}` || 'MaroShop',
  // ... autres champs
}));
```

## ✅ Vérifications à Faire

1. **Base de données:** La colonne `nom` existe-t-elle ?
2. **Entité:** Le champ `nom` est-il présent ?
3. **DTO:** Le champ `nom` est-il mappé ?
4. **Service:** Le mapping inclut-il le nom ?
5. **Controller:** Le DTO est-il correctement retourné ?

## 🔧 Fix Backend Urgent

Si la colonne `nom` n'existe pas :
```sql
ALTER TABLE boutiques ADD COLUMN nom VARCHAR(255) NOT NULL DEFAULT 'MaroShop';
UPDATE boutiques SET nom = 'MaroShop' WHERE id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';
```

## 📋 Réponse API Attendue

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

**Le champ `nom` DOIT être présent et non null !**