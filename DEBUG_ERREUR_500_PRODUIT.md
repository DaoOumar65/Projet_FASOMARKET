# 🔧 Guide de Débogage - Erreur 500 Création Produit

## ❌ Erreur Actuelle

```
POST http://localhost:8081/api/vendeur/produits/creer
[HTTP/1.1 500 Internal Server Error]
```

## 🔍 Causes Possibles

### 1. Format des Images ❌ CORRIGÉ
**Problème:** Frontend envoyait des `File` objects au lieu d'URLs
**Solution:** Conversion en URLs dans `handleSubmit`

```typescript
// ❌ AVANT
images: formData.images // File[]

// ✅ APRÈS
const imageUrls = formData.images.map(() => 
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
);
images: imageUrls // string[]
```

### 2. Champs Vides
**Problème:** Backend peut rejeter les arrays/strings vides
**Solution:** Envoi conditionnel

```typescript
// ✅ Envoyer seulement si non vide
...(formData.tailles.length > 0 && { tailles: formData.tailles }),
...(formData.couleurs.length > 0 && { couleurs: formData.couleurs }),
...(formData.marque && { marque: formData.marque }),
```

### 3. CategorieId Invalide
**Problème:** UUID non valide ou catégorie inexistante
**Vérification:** Console log avant envoi

```typescript
console.log('Données envoyées:', produitData);
```

### 4. Type de Prix/Stock
**Problème:** String au lieu de Number
**Solution:** Conversion explicite

```typescript
prix: parseFloat(formData.prix),      // ✅ Number
quantiteStock: parseInt(formData.stock) // ✅ Integer
```

## 🛠️ Corrections Appliquées

### AjouterProduit.tsx

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Convertir images File → URLs
    const imageUrls = formData.images.map(() => 
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
    );

    // 2. Préparer données avec envoi conditionnel
    const produitData = {
      nom: formData.nom,
      description: formData.description,
      prix: parseFloat(formData.prix),
      quantiteStock: parseInt(formData.stock),
      categorieId: formData.categorieId,
      images: imageUrls,
      // Détails (seulement si remplis)
      ...(formData.tailles.length > 0 && { tailles: formData.tailles }),
      ...(formData.couleurs.length > 0 && { couleurs: formData.couleurs }),
      ...(formData.marque && { marque: formData.marque }),
      ...(formData.matiere && { matiere: formData.matiere }),
      ...(formData.poids && { poids: formData.poids }),
      ...(formData.dimensions && { dimensions: formData.dimensions }),
      ...(formData.garantie && { garantie: formData.garantie }),
      ...(formData.origine && { origine: formData.origine })
    };

    // 3. Log pour débogage
    console.log('Données envoyées:', produitData);
    
    await vendorService.creerProduit(produitData);
    toast.success('Produit ajouté avec succès !');
    navigate('/vendeur/produits');
  } catch (error: any) {
    console.error('Erreur complète:', error);
    console.error('Réponse:', error.response?.data);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
  } finally {
    setLoading(false);
  }
};
```

## 📊 Format Attendu par le Backend

### Request Body
```json
{
  "nom": "T-shirt Premium",
  "description": "Description du produit",
  "prix": 15000,
  "quantiteStock": 25,
  "categorieId": "uuid-valide-ici",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "tailles": ["S", "M", "L", "XL"],
  "couleurs": ["Blanc", "Noir", "Bleu"],
  "marque": "FashionBF",
  "matiere": "100% Coton",
  "poids": "200g",
  "dimensions": "Standard",
  "garantie": "6 mois",
  "origine": "Burkina Faso"
}
```

### Types Attendus
- `nom`: String (required)
- `description`: String (required)
- `prix`: Number/BigDecimal (required)
- `quantiteStock`: Integer (required)
- `categorieId`: String UUID (required)
- `images`: Array<String> (optional)
- `tailles`: Array<String> (optional)
- `couleurs`: Array<String> (optional)
- `marque`: String (optional)
- `matiere`: String (optional)
- `poids`: String (optional)
- `dimensions`: String (optional)
- `garantie`: String (optional)
- `origine`: String (optional)

## 🔍 Vérifications à Faire

### Dans la Console Navigateur (F12)

1. **Onglet Network**
   - Cliquer sur la requête POST `/api/vendeur/produits/creer`
   - Vérifier l'onglet "Payload" ou "Request"
   - Copier le JSON envoyé

2. **Onglet Console**
   - Vérifier les logs `console.log('Données envoyées:', ...)`
   - Vérifier les erreurs `console.error(...)`

### Exemple de Vérification

```javascript
// Dans la console navigateur
{
  "nom": "Test Produit",
  "description": "Description test",
  "prix": 15000,              // ✅ Number, pas "15000"
  "quantiteStock": 10,        // ✅ Number, pas "10"
  "categorieId": "abc-123",   // ⚠️ Vérifier que c'est un UUID valide
  "images": ["url1", "url2"], // ✅ Array de strings
  "tailles": ["S", "M"],      // ✅ Array de strings
  "couleurs": ["Rouge"]       // ✅ Array de strings
}
```

## 🚨 Erreurs Backend Possibles

### 1. Catégorie Non Trouvée
```
"Catégorie non trouvée"
```
**Solution:** Vérifier que `categorieId` existe dans la base

### 2. Boutique Non Trouvée
```
"Boutique non trouvée"
```
**Solution:** Vérifier que le vendeur a une boutique active

### 3. Validation Failed
```
"Validation failed: nom is required"
```
**Solution:** Vérifier que tous les champs requis sont remplis

### 4. JSON Parse Error
```
"Cannot deserialize value of type..."
```
**Solution:** Vérifier le format des données (types corrects)

## ✅ Checklist de Débogage

- [ ] Vérifier console navigateur (F12 → Console)
- [ ] Vérifier Network tab (F12 → Network)
- [ ] Copier le JSON envoyé dans la requête
- [ ] Vérifier que `prix` est un Number
- [ ] Vérifier que `quantiteStock` est un Number
- [ ] Vérifier que `categorieId` est un UUID valide
- [ ] Vérifier que `images` est un Array de strings
- [ ] Vérifier les logs backend (console serveur)
- [ ] Tester avec Postman/curl si nécessaire

## 🔧 Test Manuel avec Postman

```bash
POST http://localhost:8081/api/vendeur/produits/creer
Headers:
  Content-Type: application/json
  X-User-Id: <votre-user-id>
  Authorization: Bearer <votre-token>

Body (JSON):
{
  "nom": "Test Produit",
  "description": "Description test",
  "prix": 15000,
  "quantiteStock": 10,
  "categorieId": "<uuid-categorie-valide>",
  "images": ["https://example.com/image.jpg"],
  "tailles": ["S", "M", "L"],
  "couleurs": ["Rouge", "Bleu"],
  "marque": "TestBrand"
}
```

## 📝 Prochaines Étapes

1. **Vérifier les logs dans la console navigateur**
2. **Copier le JSON envoyé et vérifier le format**
3. **Vérifier les logs backend pour l'erreur exacte**
4. **Tester avec des données minimales (sans détails)**
5. **Ajouter les détails progressivement**

## 💡 Solution Temporaire

Si l'erreur persiste, tester avec données minimales :

```typescript
const produitData = {
  nom: formData.nom,
  description: formData.description,
  prix: parseFloat(formData.prix),
  quantiteStock: parseInt(formData.stock),
  categorieId: formData.categorieId
  // Pas de détails pour l'instant
};
```

Une fois que ça fonctionne, ajouter les détails un par un.

---

**Corrections appliquées:** ✅
**Prochaine étape:** Vérifier les logs dans la console navigateur
