# 🧪 TEST API STOCK

## Produits dans la BD:
- iPhone 12 Pro: `8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf` → stock: 15
- Boubou Elegant: `cde12486-1561-415e-9b4e-5fa3be2342a1` → stock: 25

---

## TEST 1: Récupérer un produit

### Dans la console navigateur (F12):

```javascript
fetch('http://localhost:8081/api/produits/8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf')
  .then(r => r.json())
  .then(d => {
    console.log('📦 Produit:', d.nom);
    console.log('📊 Stock BD:', 15);
    console.log('📊 Stock API:', d.quantiteStock);
    console.log('✅ Match:', d.quantiteStock === 15 ? 'OUI' : 'NON');
  })
```

**Résultat attendu:**
```
📦 Produit: Iphone 12 Pro
📊 Stock BD: 15
📊 Stock API: 15
✅ Match: OUI
```

---

## TEST 2: Récupérer tous les produits

```javascript
fetch('http://localhost:8081/api/produits/actifs')
  .then(r => r.json())
  .then(produits => {
    produits.forEach(p => {
      console.log(`${p.nom}: stock=${p.quantiteStock}`);
    });
  })
```

**Résultat attendu:**
```
Iphone 12 Pro: stock=15
Boubou Elegant: stock=25
```

---

## 🔴 SI LE STOCK EST NULL OU 0

### Cause probable: Le backend n'a pas été redémarré

**Solution:**
```bash
# Dans le terminal backend
Ctrl + C
mvn spring-boot:run
```

**Attendez de voir:**
```
Started FasomarketApplication in X.XXX seconds
```

**Puis rechargez le frontend:**
```bash
# Dans le navigateur
Ctrl + F5
```

---

## 🔍 VÉRIFICATION DÉTAILLÉE

### Ouvrez F12 → Network → Rechargez la page

1. Cherchez la requête vers `/api/produits/...`
2. Cliquez dessus
3. Onglet **Response**
4. Cherchez `"quantiteStock"`

**Doit contenir:**
```json
{
  "id": "8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf",
  "nom": "Iphone 12 Pro",
  "quantiteStock": 15,
  "disponible": true
}
```

**Si vous voyez:**
```json
{
  "quantiteStock": 0
}
```
ou
```json
{
  "quantiteStock": null
}
```

→ Le backend n'a PAS été redémarré après les modifications!

---

## ✅ SOLUTION GARANTIE

1. **Arrêter le backend:** Ctrl + C
2. **Attendre 2 secondes**
3. **Relancer:** `mvn spring-boot:run`
4. **Attendre le message:** "Started FasomarketApplication"
5. **Vider cache navigateur:** Ctrl + Shift + Delete
6. **Recharger:** Ctrl + F5
7. **Tester l'API** avec le script ci-dessus

Si après ces étapes le stock est toujours 0/null, partagez la réponse complète de l'API.
