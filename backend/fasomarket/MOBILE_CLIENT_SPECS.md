# 📱 FasoMarket Mobile Client - Spécifications Complètes

## 🎯 Vue d'Ensemble
Application mobile native (React Native/Flutter) pour les clients FasoMarket, utilisant le même backend Spring Boot que la version web.

## 🏗️ Architecture Technique

### Stack Recommandée
- **Framework**: React Native (iOS + Android)
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: NativeBase ou React Native Elements
- **Maps**: React Native Maps (Google Maps)
- **Notifications**: Firebase Cloud Messaging
- **Storage**: AsyncStorage + MMKV
- **Camera**: React Native Image Picker
- **Payments**: Intégration SDK Orange Money, Moov Money

### Configuration API
```typescript
const API_CONFIG = {
  BASE_URL: 'https://api.fasomarket.bf', // Production
  DEV_URL: 'http://192.168.1.100:8081',  // Développement
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'User-Agent': 'FasoMarket-Mobile/1.0.0',
    'X-Platform': 'mobile'
  }
};
```

## 📱 Structure de Navigation

### Bottom Tab Navigation
```
🏠 Accueil | 🔍 Recherche | 🛒 Panier | 👤 Profil
```

### Stack Navigation par Tab
```
Accueil Stack:
├── Écran Accueil
├── Détails Produit
├── Détails Boutique
└── Liste Produits Catégorie

Recherche Stack:
├── Recherche Globale
├── Filtres Avancés
├── Résultats Recherche
└── Détails Produit

Panier Stack:
├── Mon Panier
├── Checkout
├── Sélection Adresse
├── Paiement
└── Confirmation

Profil Stack:
├── Mon Profil
├── Mes Commandes
├── Détails Commande
├── Mes Adresses
├── Mes Favoris
├── Paramètres
└── Support
```

## 🎨 Design System & UI/UX

### Palette de Couleurs (Harmonisée avec Web)
```typescript
const COLORS = {
  primary: '#FF6B35',      // Orange FasoMarket
  secondary: '#2ECC71',    // Vert succès
  accent: '#3498DB',       // Bleu accent
  background: '#F8F9FA',   // Gris clair
  surface: '#FFFFFF',      // Blanc
  text: '#2C3E50',         // Gris foncé
  textSecondary: '#7F8C8D', // Gris moyen
  error: '#E74C3C',        // Rouge erreur
  warning: '#F39C12',      // Orange warning
  success: '#27AE60'       // Vert foncé
};
```

### Typography
```typescript
const FONTS = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  }
};
```

### Composants UI Réutilisables
- **FMButton**: Boutons avec variants (primary, secondary, outline)
- **FMCard**: Cartes produits/boutiques
- **FMInput**: Champs de saisie avec validation
- **FMHeader**: En-têtes d'écrans avec navigation
- **FMLoader**: Indicateurs de chargement
- **FMModal**: Modales personnalisées
- **FMBadge**: Badges notifications/statuts

## 📱 Écrans Détaillés

### 🏠 Écran Accueil
```typescript
interface AccueilScreen {
  components: [
    'Header avec logo + notifications',
    'Barre de recherche',
    'Bannière promotionnelle (carousel)',
    'Catégories populaires (grid horizontal)',
    'Produits tendance (liste horizontale)',
    'Boutiques recommandées (liste horizontale)',
    'Nouveautés (liste verticale)'
  ];
  
  endpoints: [
    'GET /api/public/accueil',
    'GET /api/public/categories',
    'GET /api/public/produits?featured=true',
    'GET /api/public/boutiques?recommended=true'
  ];
}
```

**Layout Mobile**:
```
┌─────────────────────────┐
│ 🏠 FasoMarket    🔔(3) │
├─────────────────────────┤
│ 🔍 Rechercher...       │
├─────────────────────────┤
│ [Bannière Promo]        │
├─────────────────────────┤
│ Catégories              │
│ 📱 📷 👕 🍔 ➡️         │
├─────────────────────────┤
│ Produits Tendance       │
│ [Prod1] [Prod2] ➡️     │
├─────────────────────────┤
│ Boutiques Populaires    │
│ [Shop1] [Shop2] ➡️     │
└─────────────────────────┘
```

### 🔍 Écran Recherche
```typescript
interface RechercheScreen {
  components: [
    'Barre de recherche avec suggestions',
    'Filtres rapides (prix, catégorie, zone)',
    'Historique recherches',
    'Recherches populaires',
    'Résultats avec tri/filtres'
  ];
  
  endpoints: [
    'GET /api/public/recherche?q={query}',
    'GET /api/public/produits?filters={filters}',
    'GET /api/public/categories'
  ];
}
```

### 🛒 Écran Panier
```typescript
interface PanierScreen {
  components: [
    'Liste articles avec quantités',
    'Résumé prix (sous-total, livraison, total)',
    'Code promo',
    'Bouton checkout',
    'Suggestions produits similaires'
  ];
  
  endpoints: [
    'GET /api/client/panier',
    'POST /api/client/panier/ajouter',
    'DELETE /api/client/panier/{itemId}',
    'PUT /api/client/panier/{itemId}/quantite'
  ];
}
```

### 💳 Écran Paiement
```typescript
interface PaiementScreen {
  components: [
    'Sélection mode paiement',
    'Formulaire paiement mobile money',
    'Résumé commande',
    'Conditions générales',
    'Bouton payer'
  ];
  
  endpoints: [
    'GET /api/client/paiement/modes',
    'POST /api/client/paiement/simuler',
    'POST /api/client/commandes/creer'
  ];
}
```

### 👤 Écran Profil
```typescript
interface ProfilScreen {
  components: [
    'Photo profil + infos utilisateur',
    'Menu navigation (commandes, adresses, favoris)',
    'Statistiques (commandes, montant dépensé)',
    'Paramètres compte',
    'Support/Contact'
  ];
  
  endpoints: [
    'GET /api/auth/profil',
    'PUT /api/auth/profil',
    'GET /api/client/dashboard'
  ];
}
```

## 🔗 Endpoints API Complets

### Authentification
```typescript
// Connexion
POST /api/auth/connexion
Body: { telephone: string, motDePasse: string }
Response: { token: string, user: User, expiresIn: number }

// Inscription
POST /api/auth/inscription-client
Body: { nomComplet: string, telephone: string, email: string, motDePasse: string }

// Profil
GET /api/auth/profil
Headers: { Authorization: "Bearer {token}", X-User-Id: "{userId}" }
```

### Catalogue Produits
```typescript
// Accueil
GET /api/public/accueil
Response: { categories: Category[], produitsTendance: Product[], boutiquesPopulaires: Shop[] }

// Produits
GET /api/public/produits?page=0&size=20&categorie={cat}&prixMin={min}&prixMax={max}
GET /api/public/produits/{id}

// Recherche
GET /api/public/recherche?q={query}&type={produits|boutiques|categories}

// Catégories
GET /api/public/categories
GET /api/public/categories/{id}/produits
```

### Gestion Panier
```typescript
// Panier
GET /api/client/panier
POST /api/client/panier/ajouter
Body: { produitId: string, quantite: number }

DELETE /api/client/panier/{itemId}
DELETE /api/client/panier/vider
PUT /api/client/panier/{itemId}/quantite
Body: { quantite: number }
```

### Commandes
```typescript
// Créer commande
POST /api/client/commandes/creer
Body: { 
  adresseLivraison: string,
  numeroTelephone: string,
  needsDelivery: boolean,
  modePaiement: string
}

// Mes commandes
GET /api/client/commandes
GET /api/client/commandes/{id}

// Annuler commande
PUT /api/client/commandes/{id}/annuler
```

### Paiement Mobile
```typescript
// Modes de paiement
GET /api/client/paiement/modes
Response: [
  { id: "ORANGE_MONEY", nom: "Orange Money", logo: "orange.png", actif: true },
  { id: "MOOV_MONEY", nom: "Moov Money", logo: "moov.png", actif: true },
  { id: "CORIS_MONEY", nom: "Coris Money", logo: "coris.png", actif: true },
  { id: "CASH_ON_DELIVERY", nom: "Paiement à la livraison", actif: true }
]

// Simuler paiement
POST /api/client/paiement/simuler
Body: {
  commandeId: string,
  modePaiement: string,
  numeroTelephone: string,
  montant: number
}
```

### Gestion Profil
```typescript
// Dashboard client
GET /api/client/dashboard
Response: {
  statistiques: {
    commandesEnCours: number,
    commandesTerminees: number,
    montantTotalDepense: number,
    notificationsNonLues: number
  },
  commandesRecentes: Order[],
  recommandations: Product[]
}

// Adresses
GET /api/client/adresses
POST /api/client/adresses/ajouter
PUT /api/client/adresses/{id}
DELETE /api/client/adresses/{id}

// Favoris
GET /api/client/favoris
POST /api/client/favoris/ajouter
DELETE /api/client/favoris/{produitId}
```

### Notifications
```typescript
// Notifications
GET /api/client/notifications
GET /api/client/notifications/compteur
PUT /api/client/notifications/{id}/lue
PUT /api/client/notifications/toutes-lues
```

## 🔔 Notifications Push

### Configuration Firebase
```typescript
// Types de notifications
enum NotificationType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PAYMENT_SUCCESS = 'payment_success',
  PROMOTION = 'promotion',
  NEW_PRODUCT = 'new_product'
}

// Payload notification
interface PushNotification {
  title: string;
  body: string;
  data: {
    type: NotificationType;
    orderId?: string;
    productId?: string;
    deepLink: string;
  };
}
```

## 📱 Fonctionnalités Mobiles Spécifiques

### Géolocalisation
```typescript
// Localisation utilisateur pour livraison
import Geolocation from '@react-native-community/geolocation';

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position.coords),
      error => reject(error),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
};
```

### Caméra/Photos
```typescript
// Upload photo profil ou preuve livraison
import ImagePicker from 'react-native-image-picker';

const selectImage = () => {
  ImagePicker.showImagePicker(options, response => {
    if (response.uri) {
      uploadImage(response);
    }
  });
};
```

### Stockage Local
```typescript
// Cache données pour mode hors-ligne
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder panier
await AsyncStorage.setItem('cart', JSON.stringify(cartItems));

// Récupérer favoris
const favorites = await AsyncStorage.getItem('favorites');
```

### Partage Social
```typescript
// Partager produit
import Share from 'react-native-share';

const shareProduct = async (product) => {
  const options = {
    title: product.nom,
    message: `Découvrez ${product.nom} sur FasoMarket`,
    url: `https://fasomarket.bf/produits/${product.id}`
  };
  await Share.open(options);
};
```

## 🎨 Harmonisation Web/Mobile

### Cohérence Visuelle
- **Logo identique** sur web et mobile
- **Couleurs primaires** exactement les mêmes
- **Typography** adaptée mais cohérente
- **Iconographie** même style d'icônes
- **Photos produits** identiques

### Expérience Utilisateur
- **Navigation** logique similaire
- **Terminologie** identique (panier, commandes, etc.)
- **Workflow** checkout identique
- **Statuts commandes** mêmes libellés
- **Messages d'erreur** cohérents

### Synchronisation Données
- **Panier** synchronisé entre web/mobile
- **Favoris** partagés
- **Historique** commandes identique
- **Profil** utilisateur unifié
- **Notifications** cross-platform

## 🚀 Fonctionnalités Avancées

### Mode Hors-ligne
```typescript
// Gestion connectivité
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (!state.isConnected) {
    // Basculer en mode hors-ligne
    showOfflineMode();
  }
});
```

### Recherche Vocale
```typescript
// Intégration reconnaissance vocale
import Voice from '@react-native-voice/voice';

const startVoiceSearch = async () => {
  try {
    await Voice.start('fr-FR');
  } catch (error) {
    console.error(error);
  }
};
```

### Scan QR Code
```typescript
// Scanner codes produits
import QRCodeScanner from 'react-native-qrcode-scanner';

const onQRRead = (e) => {
  // Rediriger vers produit scanné
  navigation.navigate('ProductDetails', { id: e.data });
};
```

## 📊 Analytics & Tracking

### Événements à Tracker
```typescript
// Analytics Firebase
import analytics from '@react-native-firebase/analytics';

// Événements e-commerce
await analytics().logEvent('add_to_cart', {
  item_id: product.id,
  item_name: product.nom,
  item_category: product.categorie,
  value: product.prix
});

await analytics().logEvent('purchase', {
  transaction_id: order.id,
  value: order.totalAmount,
  currency: 'XOF'
});
```

## 🔒 Sécurité Mobile

### Stockage Sécurisé
```typescript
// Keychain pour tokens sensibles
import Keychain from 'react-native-keychain';

// Sauvegarder token
await Keychain.setInternetCredentials(
  'fasomarket_token',
  'user',
  authToken
);
```

### Validation Certificats
```typescript
// Certificate pinning pour API
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  // Certificate pinning configuration
});
```

## 🧪 Tests & Qualité

### Tests Unitaires
- **Redux actions/reducers**
- **Utilitaires/helpers**
- **Composants UI**

### Tests d'Intégration
- **Navigation flows**
- **API calls**
- **Paiement workflow**

### Tests E2E
- **Parcours complet achat**
- **Authentification**
- **Gestion panier**

## 📦 Déploiement

### Build Configuration
```typescript
// Config environnements
const config = {
  development: {
    API_URL: 'http://192.168.1.100:8081',
    DEBUG: true
  },
  staging: {
    API_URL: 'https://staging-api.fasomarket.bf',
    DEBUG: false
  },
  production: {
    API_URL: 'https://api.fasomarket.bf',
    DEBUG: false
  }
};
```

### App Store Optimization
- **Nom**: FasoMarket - Shopping Burkina
- **Description**: Marketplace #1 au Burkina Faso
- **Mots-clés**: shopping, burkina faso, e-commerce, mobile money
- **Screenshots**: Écrans principaux optimisés
- **Icône**: Logo FasoMarket adapté mobile

Cette spécification complète assure une parfaite harmonisation entre les versions web et mobile de FasoMarket, tout en exploitant les capacités spécifiques du mobile pour une expérience utilisateur optimale.