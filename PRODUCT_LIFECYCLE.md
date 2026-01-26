# 🔄 CYCLE DE VIE COMPLET D'UN PRODUIT - FasoMarket

## 📋 VUE D'ENSEMBLE

Ce document trace le parcours complet d'un produit depuis sa création jusqu'à sa livraison au client.

---

## 1️⃣ CRÉATION DU PRODUIT (Vendeur)

### Étape 1.1: Upload des Images
**Page**: `/vendeur/ajouter-produit`

```typescript
// Frontend
1. Vendeur sélectionne images (max 10)
2. Upload automatique vers backend
   POST /api/upload/image
3. Backend retourne URLs
4. URLs stockées dans state
```

**Status**: ✅ IMPLÉMENTÉ

### Étape 1.2: Remplissage Formulaire
```typescript
// Champs obligatoires
- Nom du produit
- Description
- Prix (FCFA)
- Stock initial
- Catégorie

// Détails optionnels
- Tailles disponibles (S, M, L, XL...)
- Couleurs disponibles
- Marque
- Matière
- Poids
- Dimensions
- Garantie
- Origine
```

**Status**: ✅ IMPLÉMENTÉ

### Étape 1.3: Soumission
```typescript
// Frontend envoie
POST /api/vendeur/produits/creer
{
  nom, description, prix, stock,
  categorieId, images: [urls],
  sizes, colors, marque, materiau,
  poids, dimensions, periodeGarantie, origine
}

// Backend crée produit
- Génère ID unique
- Associe à la boutique du vendeur
- Status = "ACTIVE"
- Disponible = true
- DateCreation = now()
- NombreVentes = 0
```

**Status**: ✅ IMPLÉMENTÉ

---

## 2️⃣ AFFICHAGE PUBLIC DU PRODUIT

### Étape 2.1: Liste Publique
**Page**: `/produits` ou `/boutiques/{id}`

```typescript
// Frontend récupère
GET /api/public/produits?page=0&size=20
GET /api/public/boutiques/{id}/produits

// Affichage
- Grille de cards produits
- Image principale
- Nom, prix
- Badges: marque, tailles, couleurs
- Bouton "Voir détails"
```

**Status**: ✅ IMPLÉMENTÉ

### Étape 2.2: Page Détail Produit
**Page**: `/produits/{id}`

```typescript
// Frontend récupère
GET /api/public/produits/{id}

// Affichage complet
- Galerie images (navigation)
- Nom, description, prix
- Sélection taille (boutons interactifs)
- Sélection couleur (boutons interactifs)
- Grille détails (marque, matière, poids, dimensions, garantie, origine)
- Info boutique (nom, adresse, livraison)
- Stock disponible
- Sélecteur quantité
- Bouton "Ajouter au panier"
```

**Status**: ✅ IMPLÉMENTÉ

---

## 3️⃣ AJOUT AU PANIER (Client)

### Étape 3.1: Ajout depuis Page Détail
```typescript
// Client clique "Ajouter au panier"
1. Vérification authentification
2. Vérification rôle CLIENT
3. Récupération détails produit complets
4. Ajout au panier local (localStorage)
5. Synchronisation backend si connecté
   POST /api/client/panier/ajouter
   { produitId, quantite }
6. Toast confirmation
7. Mise à jour compteur panier (navbar)
```

**Status**: ✅ IMPLÉMENTÉ

### Étape 3.2: Gestion Panier
**Page**: `/panier`

```typescript
// Affichage panier
- Liste items avec images
- Nom, prix unitaire
- Sélecteur quantité (+/-)
- Sous-total par item
- Bouton supprimer
- Total général
- Frais livraison par boutique
- Bouton "Commander"

// Actions possibles
- Modifier quantité
- Supprimer item
- Vider panier
- Continuer shopping
- Passer commande
```

**Status**: ✅ IMPLÉMENTÉ

---

## 4️⃣ CRÉATION DE LA COMMANDE (Client)

### Étape 4.1: Validation Panier
```typescript
// Vérifications avant commande
1. Panier non vide
2. Stock disponible pour chaque produit
3. Produits toujours actifs
4. Boutiques toujours actives
```

**Status**: ✅ IMPLÉMENTÉ (Frontend)
**Status**: ⚠️ À IMPLÉMENTER (Backend validation)

### Étape 4.2: Formulaire Commande
**Page**: `/commander`

```typescript
// Informations requises
- Adresse de livraison
- Méthode de paiement
  * Mobile Money (Orange Money, Moov Money)
  * Paiement à la livraison
  * Carte bancaire
- Numéro de téléphone
- Instructions spéciales (optionnel)

// Récapitulatif
- Liste produits
- Sous-total produits
- Frais de livraison
- Total à payer
```

**Status**: ⚠️ À IMPLÉMENTER

### Étape 4.3: Soumission Commande
```typescript
// Frontend envoie
POST /api/client/commandes/creer
{
  adresseLivraison,
  methodePaiement,
  numeroTelephone,
  instructions
}

// Backend traite
1. Récupère items du panier
2. Vérifie stock disponible
3. Crée commande avec statut "EN_ATTENTE"
4. Génère numéro commande (CMD-YYYYMMDD-XXX)
5. Groupe items par boutique
6. Calcule totaux (produits + livraison)
7. Réduit stock des produits
8. Vide le panier
9. Envoie notification au client
10. Envoie notification aux vendeurs
11. Retourne détails commande
```

**Status**: ⚠️ À IMPLÉMENTER (Backend)

---

## 5️⃣ GESTION COMMANDE (Vendeur)

### Étape 5.1: Réception Notification
```typescript
// Vendeur reçoit notification
- "Nouvelle commande reçue"
- Numéro commande
- Nombre de produits
- Montant total
- Lien vers détails
```

**Status**: ⚠️ À IMPLÉMENTER

### Étape 5.2: Consultation Commandes
**Page**: `/vendeur/commandes`

```typescript
// Liste commandes
GET /api/vendeur/commandes

// Affichage
- Numéro commande
- Date
- Client (nom, téléphone)
- Produits commandés
- Quantités
- Montant total
- Statut actuel
- Actions disponibles

// Filtres
- Par statut
- Par date
- Par client
- Par montant
```

**Status**: ✅ IMPLÉMENTÉ (Frontend)
**Status**: ⚠️ À IMPLÉMENTER (Backend)

### Étape 5.3: Détails Commande
**Page**: `/vendeur/commandes/{id}`

```typescript
// Informations complètes
- Numéro commande
- Date et heure
- Statut actuel
- Historique statuts

// Client
- Nom complet
- Téléphone
- Adresse livraison

// Produits
- Liste avec images
- Quantités
- Prix unitaires
- Sous-totaux

// Totaux
- Sous-total produits
- Frais livraison
- Total général

// Actions
- Changer statut
- Imprimer bon de commande
- Contacter client
- Annuler commande
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 6️⃣ TRAITEMENT COMMANDE (Vendeur)

### Étape 6.1: Confirmation Commande
```typescript
// Vendeur confirme
PUT /api/vendeur/commandes/{id}/statut
{ statut: "EN_PREPARATION" }

// Backend
1. Met à jour statut
2. Enregistre date changement
3. Envoie notification client
   "Votre commande est en préparation"
```

**Status**: ✅ IMPLÉMENTÉ (Frontend)
**Status**: ⚠️ À IMPLÉMENTER (Backend)

### Étape 6.2: Préparation Produits
```typescript
// Vendeur prépare
- Emballe les produits
- Vérifie qualité
- Prépare facture
- Marque comme "PRETE"

PUT /api/vendeur/commandes/{id}/statut
{ statut: "PRETE" }

// Notification client
"Votre commande est prête pour la livraison"
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 7️⃣ LIVRAISON (Vendeur/Livreur)

### Étape 7.1: Départ Livraison
```typescript
// Vendeur/Livreur démarre
PUT /api/vendeur/commandes/{id}/statut
{ statut: "EN_LIVRAISON" }

// Notification client
"Votre commande est en cours de livraison"
"Livreur: [Nom]"
"Téléphone: [Numéro]"
```

**Status**: ⚠️ À IMPLÉMENTER

### Étape 7.2: Confirmation Livraison
```typescript
// Livreur confirme livraison
PUT /api/vendeur/commandes/{id}/statut
{ 
  statut: "LIVREE",
  dateLivraison: now(),
  signatureClient: "base64_image" (optionnel)
}

// Backend
1. Met à jour statut
2. Enregistre date livraison
3. Incrémente nombreVentes des produits
4. Calcule commission plateforme
5. Envoie notification client
   "Votre commande a été livrée"
6. Demande avis client (après 24h)
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 8️⃣ SUIVI CLIENT

### Étape 8.1: Historique Commandes
**Page**: `/client/commandes`

```typescript
// Liste commandes client
GET /api/client/historique-commandes

// Affichage
- Numéro commande
- Date
- Boutique(s)
- Produits (miniatures)
- Montant total
- Statut actuel
- Bouton "Voir détails"

// Filtres
- Par statut
- Par date
- Par boutique
```

**Status**: ✅ IMPLÉMENTÉ (Frontend)
**Status**: ⚠️ À IMPLÉMENTER (Backend)

### Étape 8.2: Détails Commande Client
**Page**: `/client/commandes/{id}`

```typescript
// Informations
- Numéro commande
- Date commande
- Statut actuel avec timeline
- Produits commandés
- Adresse livraison
- Méthode paiement
- Totaux

// Timeline statuts
EN_ATTENTE → EN_PREPARATION → PRETE → EN_LIVRAISON → LIVREE

// Actions possibles
- Contacter vendeur
- Annuler (si EN_ATTENTE)
- Signaler problème
- Laisser avis (si LIVREE)
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 9️⃣ AVIS ET ÉVALUATIONS

### Étape 9.1: Demande Avis
```typescript
// 24h après livraison
- Notification client
- Email/SMS
- "Comment s'est passée votre commande?"
- Lien vers formulaire avis
```

**Status**: ⚠️ À IMPLÉMENTER

### Étape 9.2: Soumission Avis
```typescript
// Client évalue
POST /api/client/commandes/{id}/avis
{
  note: 1-5,
  commentaire: "...",
  photos: [urls] (optionnel)
}

// Backend
1. Enregistre avis
2. Met à jour note moyenne produit
3. Met à jour note moyenne boutique
4. Envoie notification vendeur
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 🔟 STATISTIQUES ET ANALYTICS

### Étape 10.1: Dashboard Vendeur
**Page**: `/vendeur/dashboard`

```typescript
// Métriques produit
- Vues produit
- Ajouts au panier
- Taux conversion
- Nombre ventes
- Chiffre d'affaires
- Note moyenne
- Stock restant
- Alertes stock faible

// Graphiques
- Ventes par jour/semaine/mois
- Produits les plus vendus
- Revenus par catégorie
```

**Status**: ⚠️ À IMPLÉMENTER

### Étape 10.2: Gestion Stock
**Page**: `/vendeur/gestion-stock`

```typescript
// Liste produits
- Nom produit
- Stock actuel
- Seuil alerte
- Ventes 30 derniers jours
- Prévision rupture
- Actions (réapprovisionner)

// Alertes
- Stock faible (< seuil)
- Rupture de stock
- Produits inactifs
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 1️⃣1️⃣ GESTION RETOURS ET ANNULATIONS

### Étape 11.1: Annulation Client
```typescript
// Client annule (si EN_ATTENTE)
PUT /api/client/commandes/{id}/annuler
{ raison: "..." }

// Backend
1. Vérifie statut (seulement EN_ATTENTE)
2. Restaure stock produits
3. Met à jour statut "ANNULEE"
4. Envoie notification vendeur
5. Rembourse si paiement effectué
```

**Status**: ⚠️ À IMPLÉMENTER

### Étape 11.2: Retour Produit
```typescript
// Client demande retour (7 jours après livraison)
POST /api/client/commandes/{id}/retour
{
  produits: [ids],
  raison: "...",
  photos: [urls]
}

// Processus
1. Vendeur examine demande
2. Accepte/Refuse retour
3. Si accepté: client renvoie produit
4. Vendeur confirme réception
5. Remboursement client
6. Stock restauré
```

**Status**: ⚠️ À IMPLÉMENTER

---

## 📊 RÉCAPITULATIF STATUTS

### Statuts Produit
- `ACTIVE` - Visible et achetable ✅
- `HIDDEN` - Masqué temporairement ✅
- `RUPTURE_STOCK` - Stock = 0 ⚠️
- `ARCHIVE` - Produit archivé ⚠️

### Statuts Commande
- `EN_ATTENTE` - Commande reçue ✅
- `EN_PREPARATION` - Vendeur prépare ✅
- `PRETE` - Prête pour livraison ⚠️
- `EN_LIVRAISON` - En cours de livraison ⚠️
- `LIVREE` - Livrée au client ⚠️
- `ANNULEE` - Annulée ⚠️
- `RETOURNEE` - Retournée ⚠️

---

## ✅ STATUT D'IMPLÉMENTATION

### ✅ IMPLÉMENTÉ (Frontend + Backend Partiel)
1. ✅ Création produit avec images et détails
2. ✅ Affichage public produits
3. ✅ Page détail produit complète
4. ✅ Ajout au panier
5. ✅ Gestion panier (localStorage + backend)
6. ✅ Liste produits vendeur
7. ✅ Modification/Suppression produit
8. ✅ Changement statut produit (ACTIVE/HIDDEN)

### ⚠️ À IMPLÉMENTER (Backend Principalement)
1. ⚠️ Création commande complète
2. ⚠️ Gestion statuts commande
3. ⚠️ Notifications temps réel
4. ⚠️ Historique commandes
5. ⚠️ Détails commande (client + vendeur)
6. ⚠️ Système de livraison
7. ⚠️ Avis et évaluations
8. ⚠️ Dashboard analytics
9. ⚠️ Gestion stock avancée
10. ⚠️ Retours et annulations
11. ⚠️ Validation stock lors commande
12. ⚠️ Calcul automatique frais livraison
13. ⚠️ Intégration paiement mobile money
14. ⚠️ Génération factures PDF
15. ⚠️ Système de tracking livraison

---

## 🎯 PROCHAINES ÉTAPES PRIORITAIRES

### Phase 1: Commandes (Critique)
1. Backend: Endpoint création commande
2. Backend: Validation stock
3. Backend: Réduction stock automatique
4. Frontend: Page formulaire commande
5. Frontend: Page confirmation commande
6. Backend: Génération numéro commande

### Phase 2: Suivi Commandes
1. Backend: Endpoints historique commandes
2. Backend: Endpoint détails commande
3. Backend: Endpoint changement statut
4. Frontend: Page historique client
5. Frontend: Page détails commande
6. Frontend: Page gestion commandes vendeur

### Phase 3: Notifications
1. Backend: Système notifications
2. Backend: Envoi notifications email/SMS
3. Frontend: Composant notifications
4. Frontend: Badge compteur notifications
5. WebSocket pour temps réel (optionnel)

### Phase 4: Livraison
1. Backend: Gestion livreurs
2. Backend: Attribution commandes
3. Backend: Tracking GPS (optionnel)
4. Frontend: Interface livreur
5. Frontend: Suivi temps réel client

### Phase 5: Avis et Analytics
1. Backend: Système avis
2. Backend: Calcul notes moyennes
3. Backend: Analytics et statistiques
4. Frontend: Formulaire avis
5. Frontend: Dashboard analytics

---

## 📝 CONCLUSION

**Cycle de vie actuel**: 
- ✅ Création → Affichage → Panier (100% fonctionnel)
- ⚠️ Commande → Livraison (À implémenter)

**Pour un système complet**, il faut implémenter:
1. Système de commandes complet
2. Gestion des statuts et workflow
3. Notifications
4. Système de livraison
5. Avis et évaluations

**Le frontend est prêt** pour toutes ces fonctionnalités. Il suffit d'implémenter les endpoints backend correspondants selon BACKEND_API_COMPLETE.md! 🚀
