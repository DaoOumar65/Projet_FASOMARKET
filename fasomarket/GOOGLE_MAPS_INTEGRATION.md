# 🗺️ INTÉGRATION GOOGLE MAPS - FASOMARKET

## ✅ **FONCTIONNALITÉS AJOUTÉES**

### 🏪 **Modèle Boutique enrichi**
- `getAdresseCompleteAttribute()` - Adresse formatée complète
- `getGoogleMapsUrlAttribute()` - URL pour voir sur Google Maps
- `getDirectionsUrlAttribute()` - URL pour obtenir l'itinéraire
- `geocoderAdresse()` - Conversion automatique adresse → lat/lng

### 🛣️ **Nouvelles routes API**
- `GET /api/boutiques/{id}/itineraire` - Obtenir les URLs Google Maps

### 📱 **API JavaScript enrichie**
```javascript
// Obtenir les informations d'itinéraire
const response = await fasoMarketAPI.shops.getItineraire(boutiqueId);

// Ouvrir Google Maps pour voir la boutique
fasoMarketAPI.shops.ouvrirGoogleMaps(boutique.google_maps_url);

// Ouvrir l'itinéraire dans Google Maps
fasoMarketAPI.shops.obtenirDirections(boutique.directions_url);
```

### 🔧 **Configuration requise**
1. **Fichier .env** :
```
GOOGLE_MAPS_API_KEY=votre_clé_api_google
```

2. **Obtenir une clé API Google Maps** :
   - Aller sur [Google Cloud Console](https://console.cloud.google.com/)
   - Activer l'API Geocoding
   - Créer une clé API

### 🎯 **Utilisation**

#### **Création de boutique**
```javascript
const boutique = {
    nom_boutique: "Ma Boutique",
    adresse: "Avenue Kwame Nkrumah",
    ville: "Ouagadougou",
    pays: "Burkina Faso"
    // lat/lng seront générés automatiquement
};

await fasoMarketAPI.shops.create(boutique);
```

#### **Affichage avec Google Maps**
```javascript
// Charger une boutique
const response = await fasoMarketAPI.shops.getItineraire(1);
const boutique = response.boutique;

// Bouton "Voir sur Maps"
<button onclick="fasoMarketAPI.shops.ouvrirGoogleMaps('${boutique.google_maps_url}')">
    📍 Voir sur Google Maps
</button>

// Bouton "Obtenir l'itinéraire"
<button onclick="fasoMarketAPI.shops.obtenirDirections('${boutique.directions_url}')">
    🧭 Obtenir l'itinéraire
</button>
```

### 🔄 **Flux automatique**
1. **Vendeur saisit l'adresse** (texte lisible)
2. **API géocode automatiquement** → lat/lng
3. **Client clique sur boutique** → URLs Google Maps générées
4. **Redirection vers Google Maps** avec itinéraire

### 🌍 **Avantages**
- ✅ **Adresses lisibles** pour les vendeurs
- ✅ **Géolocalisation automatique** 
- ✅ **Intégration native Google Maps**
- ✅ **Itinéraires en un clic**
- ✅ **Compatible mobile et desktop**

Plus besoin de connaître latitude/longitude ! Les vendeurs saisissent simplement l'adresse et les clients obtiennent l'itinéraire en un clic.