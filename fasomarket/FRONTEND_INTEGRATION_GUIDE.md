# 🚀 Guide d'Intégration Frontend FasoMarket

## 📋 Vue d'ensemble

Ce guide explique comment intégrer complètement l'API FasoMarket dans votre application frontend (React, Vue.js, Angular, ou vanilla JavaScript).

### 📁 Fichiers importants
- `fasoMarketAPI.js` - Client API complet
- `FRONTEND_INTEGRATION_GUIDE.md` - Ce guide
- `LARAVEL_API_COMPLETE.md` - Documentation API backend

---

## 🛠️ Installation et Configuration

### 1. Copier le fichier API
```bash
# Copiez le fichier fasoMarketAPI.js dans votre projet frontend
cp fasomarket/fasoMarketAPI.js votre-projet/src/services/
```

### 2. Configuration des variables d'environnement
```javascript
// .env
REACT_APP_API_URL=http://localhost:8000/api
// ou pour production
REACT_APP_API_URL=https://api.fasomarket.bf/api
```

### 3. Import dans votre application
```javascript
// ES6 Modules
import fasoMarketAPI from './services/fasoMarketAPI';

// CommonJS
const fasoMarketAPI = require('./services/fasoMarketAPI');

// Instanciation personnalisée
import { FasoMarketAPI } from './services/fasoMarketAPI';
const api = new FasoMarketAPI();
```

---

## 🔐 Authentification Complète

### Flux d'inscription client
```javascript
// 1. Envoyer OTP
const otpResult = await fasoMarketAPI.auth.envoyerOtp('+22670123456', 'inscription');
// Résultat: { success: true, message: "Code OTP envoyé", expire_dans: "5 minutes" }

// 2. Vérifier OTP
const verifyResult = await fasoMarketAPI.auth.verifierOtp('+22670123456', '123456');
// Résultat: { success: true, message: "Code OTP vérifié", telephone_verifie: true }

// 3. Inscription complète
const registerResult = await fasoMarketAPI.auth.registerClient(
  'Dupont', 'Jean', '+22670123456', 'motdepasse123'
);
// Résultat: { success: true, user: {...}, token: "..." }
```

### Connexion universelle
```javascript
// Connexion avec email/téléphone + mot de passe
const loginResult = await fasoMarketAPI.auth.login('jean@example.com', 'motdepasse123');
// ou
const loginResult = await fasoMarketAPI.auth.login('+22670123456', 'motdepasse123');
```

### Gestion de session
```javascript
// Vérifier si connecté
const isLoggedIn = fasoMarketAPI.auth.isAuthenticated();

// Récupérer l'utilisateur actuel
const currentUser = fasoMarketAPI.auth.getCurrentUser();

// Déconnexion
await fasoMarketAPI.auth.logout();
```

---

## 🏠 Page d'Accueil Dynamique

### Récupération complète des données (RECOMMANDÉ)
```javascript
const accueilData = await fasoMarketAPI.accueil.getDonneesCompletes();

if (accueilData.success) {
  const {
    statistiques,
    produits_vedettes,
    nouveaux_produits,
    boutiques_populaires,
    categories
  } = accueilData.data;

  // Utiliser les données pour afficher la page d'accueil
  console.log(`📊 ${statistiques.produits} produits disponibles`);
  console.log(`⭐ ${produits_vedettes.length} produits vedettes`);
}
```

### Récupération individuelle
```javascript
// Statistiques seulement
const stats = await fasoMarketAPI.accueil.getStatistiques();

// Produits vedettes seulement
const vedettes = await fasoMarketAPI.accueil.getProduitsVedettes();

// Boutiques populaires seulement
const boutiques = await fasoMarketAPI.accueil.getBoutiquesPopulaires();
```

---

## 📦 Gestion des Produits

### Liste des produits avec filtres
```javascript
// Tous les produits
const allProducts = await fasoMarketAPI.products.getAll();

// Avec filtres
const filteredProducts = await fasoMarketAPI.products.getAll({
  categorie_id: 1,
  boutique_id: 5,
  prix_min: 10000,
  prix_max: 50000,
  disponible: true,
  vedette: true
});

// Recherche
const searchResults = await fasoMarketAPI.products.search('Samsung', {
  categorie_id: 1,
  prix_max: 300000
});
```

### Détails d'un produit
```javascript
const product = await fasoMarketAPI.products.getById(123);

if (product.success) {
  console.log(product.produit.nom);
  console.log(product.produit.prix);
  console.log(product.variantes); // Variantes disponibles
  console.log(product.images);    // Images du produit
}
```

### Gestion des variantes
```javascript
// Récupérer les variantes
const variantes = await fasoMarketAPI.products.getVariants(123);

// Créer une variante
const newVariant = await fasoMarketAPI.products.createVariant(123, {
  nom: 'Samsung A54 - Noir 128GB',
  sku: 'SAMS-A54-BLK-128',
  prix: 280000,
  quantite_stock: 5,
  options: { couleur: 'Noir', stockage: '128GB' }
});
```

---

## 🛒 E-commerce Complet

### Gestion du panier
```javascript
// Voir le panier
const panier = await fasoMarketAPI.panier.voir();

// Ajouter au panier
await fasoMarketAPI.panier.ajouter(123, 2, 456, 'Emballage cadeau souhaité');

// Modifier quantité
await fasoMarketAPI.panier.modifierQuantite(789, 3);

// Supprimer un item
await fasoMarketAPI.panier.supprimerItem(789);

// Vider le panier
await fasoMarketAPI.panier.vider();
```

### Favoris
```javascript
// Liste des favoris
const favoris = await fasoMarketAPI.favoris.lister();

// Ajouter/retirer des favoris
await fasoMarketAPI.favoris.toggle(123);

// Ajouter explicitement
await fasoMarketAPI.favoris.ajouter(123);

// Retirer
await fasoMarketAPI.favoris.supprimer(123);
```

### Passer une commande
```javascript
const commandeData = {
  items: [
    { produit_id: 123, quantite: 2, variant_id: 456 },
    { produit_id: 789, quantite: 1 }
  ],
  adresse_livraison: 'Avenue Kwame Nkrumah, Ouagadougou',
  code_promo: 'BIENVENUE20' // optionnel
};

const commande = await fasoMarketAPI.orders.create(commandeData);
```

---

## 🏪 Gestion des Boutiques

### Recherche et affichage
```javascript
// Boutiques publiques (sans auth)
const boutiques = await fasoMarketAPI.shops.getPublic();

// Recherche par localisation
const boutiquesLocalisees = await fasoMarketAPI.shops.searchByLocation(
  'Ouagadougou', 'Burkina Faso', 'Avenue Kwame Nkrumah'
);

// Détails d'une boutique
const boutique = await fasoMarketAPI.shops.getById(456);
```

### Intégration Google Maps
```javascript
// Récupérer les URLs Google Maps
const itineraire = await fasoMarketAPI.shops.getItineraire(456);

// Ouvrir Google Maps
fasoMarketAPI.shops.ouvrirGoogleMaps(itineraire.google_maps_url);

// Obtenir les directions
fasoMarketAPI.shops.obtenirDirections(itineraire.directions_url);
```

---

## 💬 Messagerie Temps Réel

### Conversations
```javascript
// Liste des conversations
const conversations = await fasoMarketAPI.conversations.getAll();

// Créer une conversation
const newConversation = await fasoMarketAPI.conversations.create(
  789, // vendeur_id
  123, // produit_id
  'Question sur le produit',
  'Bonjour, est-ce que ce produit est disponible ?'
);

// Récupérer les messages
const messages = await fasoMarketAPI.conversations.getMessages(101);

// Envoyer un message
await fasoMarketAPI.conversations.sendMessage(101, 'Oui, disponible en stock !');

// Marquer comme lu
await fasoMarketAPI.conversations.markAsRead(202);
```

---

## 📸 Gestion des Images

### Upload d'images
```javascript
const formData = new FormData();
formData.append('images[]', imageFile1);
formData.append('images[]', imageFile2);

// Upload pour un produit
const uploadResult = await fasoMarketAPI.images.upload('produits', 123, formData);

// Upload pour une boutique
const uploadResult = await fasoMarketAPI.images.upload('boutiques', 456, formData);
```

### Gestion des images existantes
```javascript
// Supprimer une image
await fasoMarketAPI.images.delete(789);

// Réorganiser l'ordre
await fasoMarketAPI.images.updateOrder(789, 1);
```

---

## 📊 Dashboard Vendeur

### Statistiques complètes
```javascript
const dashboard = await fasoMarketAPI.vendor.getDashboard();

if (dashboard.success) {
  console.log('📈 Revenus du mois:', dashboard.revenus_mensuels);
  console.log('📦 Commandes en attente:', dashboard.commandes_en_attente);
  console.log('⭐ Note moyenne:', dashboard.note_moyenne);
}
```

### Gestion des commandes vendeur
```javascript
// Commandes reçues
const orders = await fasoMarketAPI.vendor.getOrders();

// Mettre à jour le statut
await fasoMarketAPI.vendor.updateOrderStatus(123, 'confirmee');

// Clients du vendeur
const clients = await fasoMarketAPI.vendor.getClients();
```

---

## ⚛️ Intégration React (Hooks)

### Hook personnalisé pour l'accueil
```javascript
// hooks/useAccueil.js
import { useQuery } from 'react-query';
import fasoMarketAPI from '../services/fasoMarketAPI';

export const useAccueil = () => {
  return useQuery('accueil', () => fasoMarketAPI.accueil.getDonneesCompletes(), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Hook pour les produits
```javascript
// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import fasoMarketAPI from '../services/fasoMarketAPI';

export const useProducts = (filters = {}) => {
  return useQuery(['products', filters], () => fasoMarketAPI.products.getAll(filters));
};

export const useProduct = (id) => {
  return useQuery(['product', id], () => fasoMarketAPI.products.getById(id), {
    enabled: !!id
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ productId, quantity, variantId }) =>
      fasoMarketAPI.panier.ajouter(productId, quantity, variantId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      }
    }
  );
};
```

### Hook d'authentification
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import fasoMarketAPI from '../services/fasoMarketAPI';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (fasoMarketAPI.auth.isAuthenticated()) {
        const currentUser = fasoMarketAPI.auth.getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifiant, password) => {
    const result = await fasoMarketAPI.auth.login(identifiant, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await fasoMarketAPI.auth.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
```

### Composant d'exemple - Page d'accueil
```javascript
// components/HomePage.jsx
import React from 'react';
import { useAccueil } from '../hooks/useAccueil';
import { useAddToCart } from '../hooks/useProducts';

const HomePage = () => {
  const { data: accueilData, isLoading } = useAccueil();
  const addToCart = useAddToCart();

  if (isLoading) return <div>Chargement...</div>;

  const { statistiques, produits_vedettes, boutiques_populaires } = accueilData.data;

  return (
    <div className="home-page">
      {/* Statistiques */}
      <section className="stats">
        <div className="stat-card">
          <h3>{statistiques.produits}+</h3>
          <p>Produits</p>
        </div>
        <div className="stat-card">
          <h3>{statistiques.boutiques}+</h3>
          <p>Boutiques</p>
        </div>
        <div className="stat-card">
          <h3>{statistiques.clients}+</h3>
          <p>Clients</p>
        </div>
      </section>

      {/* Produits vedettes */}
      <section>
        <h2>🌟 Produits Vedettes</h2>
        <div className="products-grid">
          {produits_vedettes.map(produit => (
            <ProductCard
              key={produit.id}
              produit={produit}
              onAddToCart={(quantity, variantId) =>
                addToCart.mutate({ productId: produit.id, quantity, variantId })
              }
            />
          ))}
        </div>
      </section>

      {/* Boutiques populaires */}
      <section>
        <h2>🏪 Boutiques Populaires</h2>
        <div className="shops-grid">
          {boutiques_populaires.map(boutique => (
            <ShopCard key={boutique.id} boutique={boutique} />
          ))}
        </div>
      </section>
    </div>
  );
};
```

---

## 🛠️ Utilitaires Inclus

### Formatage des données
```javascript
// Prix en FCFA
const prixFormate = fasoMarketAPI.utils.formatPrice(250000);
// Résultat: "250 000 FCFA"

// Date lisible
const dateFormatee = fasoMarketAPI.utils.formatDate('2024-01-15');
// Résultat: "15 janvier 2024"

// Temps écoulé
const tempsEcoule = fasoMarketAPI.utils.timeAgo('2024-01-10');
// Résultat: "il y a 5 jours"
```

### Validation
```javascript
// Email
const emailValide = fasoMarketAPI.utils.validateEmail('user@example.com');

// Téléphone burkinabé
const telValide = fasoMarketAPI.utils.validatePhone('+22670123456');
```

---

## 🚀 Déploiement et Production

### Configuration production
```javascript
// Instance API de production
const prodAPI = new FasoMarketAPI();
prodAPI.baseURL = 'https://api.fasomarket.bf/api';
```

### Variables d'environnement
```bash
# .env.production
REACT_APP_API_URL=https://api.fasomarket.bf/api
REACT_APP_GOOGLE_MAPS_KEY=votre_cle_google_maps
```

### Gestion des erreurs globale
```javascript
// Intercepteur d'erreurs global
fasoMarketAPI.request = (async (originalRequest) => {
  return (...args) => {
    try {
      return await originalRequest.apply(this, args);
    } catch (error) {
      console.error('Erreur API globale:', error);

      // Gestion spécifique des erreurs
      if (error.response?.status === 401) {
        // Redirection vers login
        window.location.href = '/connexion';
      }

      throw error;
    }
  };
})(fasoMarketAPI.request);
```

---

## 📋 Checklist d'Intégration

### ✅ Authentification
- [ ] Inscription client avec OTP
- [ ] Inscription vendeur avec OTP
- [ ] Connexion universelle
- [ ] Gestion des tokens
- [ ] Protection des routes

### ✅ Page d'Accueil
- [ ] Statistiques dynamiques
- [ ] Produits vedettes
- [ ] Boutiques populaires
- [ ] Catégories
- [ ] Données complètes en une requête

### ✅ E-commerce
- [ ] Catalogue produits avec filtres
- [ ] Détails produits + variantes
- [ ] Panier complet
- [ ] Favoris
- [ ] Passer commande

### ✅ Boutiques & Géolocalisation
- [ ] Liste boutiques publiques
- [ ] Recherche par localisation
- [ ] Intégration Google Maps
- [ ] Itinéraires et directions

### ✅ Fonctionnalités Avancées
- [ ] Messagerie client-vendeur
- [ ] Upload d'images
- [ ] Dashboard vendeur
- [ ] Gestion des commandes
- [ ] Codes promo

### ✅ UI/UX
- [ ] États de chargement
- [ ] Gestion d'erreurs
- [ ] Messages de feedback
- [ ] Responsive design
- [ ] Accessibilité

---

## 🎯 Résultat Final

Avec cette intégration complète, votre application frontend aura accès à **100% des fonctionnalités** de l'API FasoMarket :

- ✅ **Authentification OTP** sécurisée
- ✅ **E-commerce complet** avec panier et commandes
- ✅ **Gestion des produits** avec variantes et images
- ✅ **Boutiques géolocalisées** avec Google Maps
- ✅ **Messagerie temps réel** client-vendeur
- ✅ **Dashboard vendeur** avec analytics
- ✅ **API JavaScript moderne** avec gestion d'erreurs
- ✅ **Utilitaires intégrés** pour le formatage
- ✅ **Compatible** React, Vue.js, Angular, vanilla JS

**🚀 Prêt pour le lancement commercial ! 🚀**
