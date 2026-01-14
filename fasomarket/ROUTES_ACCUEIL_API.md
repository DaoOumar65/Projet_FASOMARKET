# 🏠 ROUTES API POUR PAGE D'ACCUEIL - FASOMARKET

## 📊 **ROUTES PUBLIQUES POUR L'ACCUEIL**

### **Toutes les routes sont publiques (pas d'authentification requise)**

---

## 🔢 **STATISTIQUES GÉNÉRALES**

### `GET /api/accueil/statistiques`

**Description :** Retourne les statistiques générales de la plateforme

**Réponse :**
```json
{
  "success": true,
  "succes": true,
  "statistiques": {
    "produits": 1247,
    "boutiques": 89,
    "clients": 5432,
    "vendeurs": 156,
    "commandes": 2341
  }
}
```

**Utilisation frontend :**
```javascript
const stats = await fasoMarketAPI.accueil.getStatistiques();
// Afficher : "1247+ Produits", "89+ Boutiques", etc.
```

---

## ⭐ **PRODUITS VEDETTES**

### `GET /api/accueil/produits-vedettes`

**Description :** Retourne les 8 produits mis en vedette les plus vus

**Réponse :**
```json
{
  "success": true,
  "succes": true,
  "produits": [
    {
      "id": 1,
      "nom": "Samsung Galaxy A54",
      "prix": "280000.00",
      "prix_promo": "250000.00",
      "vedette": true,
      "vues": 1234,
      "est_nouveau": false,
      "boutique": {
        "nom_boutique": "TechStore BF",
        "ville": "Ouagadougou"
      },
      "categorie": {
        "nom": "Smartphones"
      },
      "images": [...]
    }
  ]
}
```

---

## 🆕 **NOUVEAUX PRODUITS**

### `GET /api/accueil/nouveaux-produits`

**Description :** Retourne les 8 produits ajoutés dans les 7 derniers jours

**Réponse :** Même structure que produits vedettes

**Badge automatique :** `est_nouveau: true` pour produits < 7 jours

---

## 🏪 **BOUTIQUES POPULAIRES**

### `GET /api/accueil/boutiques-populaires`

**Description :** Retourne les 6 boutiques les mieux notées avec le plus de produits

**Réponse :**
```json
{
  "success": true,
  "succes": true,
  "boutiques": [
    {
      "id": 1,
      "nom_boutique": "Fashion Faso",
      "description": "Mode et accessoires",
      "ville": "Ouagadougou",
      "pays": "Burkina Faso",
      "note_moyenne": "4.50",
      "produits_count": 45,
      "vendeur": {
        "user": {
          "nom": "Ouédraogo",
          "prenom": "Marie"
        }
      },
      "images": [...]
    }
  ]
}
```

---

## 📂 **CATÉGORIES POPULAIRES**

### `GET /api/accueil/categories-populaires`

**Description :** Retourne les 8 catégories avec le plus de produits actifs

**Réponse :**
```json
{
  "success": true,
  "succes": true,
  "categories": [
    {
      "id": 1,
      "nom": "Smartphones",
      "description": "Téléphones et accessoires",
      "icone": "📱",
      "produits_count": 156
    },
    {
      "id": 2,
      "nom": "Mode Femme",
      "description": "Vêtements et accessoires féminins",
      "icone": "👗",
      "produits_count": 89
    }
  ]
}
```

---

## 🎯 **DONNÉES COMPLÈTES D'ACCUEIL**

### `GET /api/accueil/donnees-completes`

**Description :** Retourne toutes les données d'accueil en une seule requête (optimisé)

**Réponse :**
```json
{
  "success": true,
  "succes": true,
  "data": {
    "statistiques": {
      "produits": 1247,
      "boutiques": 89,
      "clients": 5432,
      "vendeurs": 156
    },
    "produits_vedettes": [...],
    "nouveaux_produits": [...],
    "boutiques_populaires": [...],
    "categories": [...]
  }
}
```

**Avantage :** Une seule requête au lieu de 5 séparées

---

## 📱 **UTILISATION JAVASCRIPT COMPLÈTE**

### **Chargement optimisé (recommandé)**
```javascript
// Une seule requête pour tout charger
async function chargerAccueil() {
    try {
        const response = await fasoMarketAPI.accueil.getDonneesCompletes();
        
        if (response.success) {
            const data = response.data;
            
            // Mettre à jour les statistiques
            document.getElementById('stats-produits').textContent = data.statistiques.produits + '+';
            document.getElementById('stats-boutiques').textContent = data.statistiques.boutiques + '+';
            document.getElementById('stats-clients').textContent = data.statistiques.clients + '+';
            
            // Afficher les produits vedettes
            afficherProduits(data.produits_vedettes, 'section-vedettes');
            
            // Afficher les nouveaux produits
            afficherProduits(data.nouveaux_produits, 'section-nouveaux');
            
            // Afficher les boutiques
            afficherBoutiques(data.boutiques_populaires, 'section-boutiques');
            
            // Afficher les catégories
            afficherCategories(data.categories, 'section-categories');
        }
    } catch (error) {
        console.error('Erreur chargement accueil:', error);
    }
}
```

### **Chargement séparé (si nécessaire)**
```javascript
// Requêtes séparées pour un contrôle plus fin
async function chargerStatistiques() {
    const stats = await fasoMarketAPI.accueil.getStatistiques();
    // Traiter les statistiques
}

async function chargerProduitsVedettes() {
    const produits = await fasoMarketAPI.accueil.getProduitsVedettes();
    // Traiter les produits vedettes
}

async function chargerBoutiquesPopulaires() {
    const boutiques = await fasoMarketAPI.accueil.getBoutiquesPopulaires();
    // Traiter les boutiques
}
```

---

## 🎨 **EXEMPLES D'AFFICHAGE**

### **Statistiques**
```html
<div class="stats-container">
    <div class="stat-card">
        <h3 id="stats-produits">1247+</h3>
        <p>Produits</p>
    </div>
    <div class="stat-card">
        <h3 id="stats-boutiques">89+</h3>
        <p>Boutiques</p>
    </div>
    <div class="stat-card">
        <h3 id="stats-clients">5432+</h3>
        <p>Clients</p>
    </div>
</div>
```

### **Produits vedettes**
```html
<section class="products-section">
    <h2>🌟 Produits Vedettes</h2>
    <div class="products-grid" id="section-vedettes">
        <!-- Produits chargés dynamiquement -->
    </div>
</section>
```

### **Badges automatiques**
```javascript
function afficherProduit(produit) {
    let badges = '';
    if (produit.vedette) badges += '<span class="badge-vedette">⭐ Vedette</span>';
    if (produit.est_nouveau) badges += '<span class="badge-nouveau">🆕 Nouveau</span>';
    if (produit.prix_promo) badges += '<span class="badge-promo">🏷️ Promo</span>';
    
    return `
        <div class="product-card">
            <h4>${produit.nom}</h4>
            <p class="prix">${produit.prix_promo || produit.prix} FCFA</p>
            <p class="boutique">${produit.boutique.nom_boutique}</p>
            <div class="badges">${badges}</div>
        </div>
    `;
}
```

---

## 🚀 **PERFORMANCE**

### **Optimisations intégrées :**
- **Eager loading** : Relations chargées en une fois
- **Limites** : 6-8 éléments par section
- **Index DB** : Requêtes optimisées
- **Cache possible** : Données peu changeantes

### **Temps de réponse typiques :**
- Statistiques : ~50ms
- Produits vedettes : ~100ms
- Données complètes : ~200ms

---

## 🎯 **INTÉGRATION AVEC LE DESIGN**

Toutes ces routes permettent de remplacer les données statiques de votre maquette par les vraies données de l'API :

**Avant (statique) :**
```html
<div>1000+ Produits</div>
<div>50+ Boutiques</div>
<div>5000+ Clients</div>
```

**Après (dynamique) :**
```javascript
// Les vrais chiffres de la base de données
const stats = await fasoMarketAPI.accueil.getStatistiques();
document.getElementById('produits-count').textContent = stats.statistiques.produits + '+';
```

**Résultat :** Page d'accueil entièrement dynamique avec les vraies données ! 🎉