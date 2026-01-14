# 📍 Géolocalisation des Adresses - Implémentation Minimale

## ✅ Modifications Effectuées

### 1. Modèle Address
Ajout des champs:
- `latitude` (DECIMAL 10,8)
- `longitude` (DECIMAL 11,8)
- `estVerifiee` (BOOLEAN)
- `ville` (VARCHAR 100)

### 2. GeocodingService
Service simple avec:
- Support Google Maps API (optionnel)
- Mode simulation si pas de clé API (retourne Ouagadougou par défaut)
- Méthode `geocodeAddress(String address)`

### 3. ClientController
Géocodage automatique lors de l'ajout d'adresse:
- Appelle `geocodingService.geocodeAddress()`
- Sauvegarde latitude/longitude si succès
- Continue sans géolocalisation si échec

### 4. Migration SQL
Fichier: `V4__add_geolocation.sql`
- Ajoute colonnes à la table `addresses`

## 🚀 Utilisation

### Ajouter une adresse (avec géocodage automatique)
```javascript
POST /api/client/adresses/ajouter
{
  "nom": "Maison",
  "adresse": "Secteur 15",
  "ville": "Ouagadougou",
  "telephone": "+22670123456",
  "parDefaut": true
}
```

**Réponse:** Adresse sauvegardée avec latitude/longitude

### Configuration (optionnelle)
```properties
# application.properties
google.maps.api.key=YOUR_API_KEY_HERE
```

**Sans clé API:** Utilise coordonnées par défaut (Ouagadougou: 12.3714, -1.5197)

## 📊 Structure de Données

```json
{
  "id": "uuid",
  "nom": "Maison",
  "adresse": "Secteur 15",
  "ville": "Ouagadougou",
  "telephone": "+22670123456",
  "parDefaut": true,
  "latitude": 12.3714,
  "longitude": -1.5197,
  "estVerifiee": true
}
```

## 🔄 Redémarrer le Backend

```bash
Ctrl+C
mvn spring-boot:run
```

La migration s'appliquera automatiquement au démarrage.
