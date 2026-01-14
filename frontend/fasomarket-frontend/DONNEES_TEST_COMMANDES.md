# 📦 Données de Test pour Backend - Commandes Vendeur

## 🎯 Vendeur ID à utiliser
```
615c948e-cb64-4eae-9c35-c45283a1ce16
```

## 📋 Commandes de Test à Créer

### Commande 1 - En Attente
```sql
INSERT INTO orders (id, client_id, status, total_amount, delivery_address, needs_delivery, delivery_phone, created_at, updated_at) 
VALUES (
  'cmd-001-uuid-here',
  'client-uuid-1', 
  'PENDING',
  25000.00,
  'Secteur 15, Rue 123, Ouagadougou',
  true,
  '+22670123456',
  NOW(),
  NOW()
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
VALUES (
  'item-001-uuid',
  'cmd-001-uuid-here',
  'produit-vendeur-615c948e',  -- Produit appartenant au vendeur 615c948e-cb64-4eae-9c35-c45283a1ce16
  2,
  12500.00,
  25000.00
);
```

### Commande 2 - Confirmée
```sql
INSERT INTO orders (id, client_id, status, total_amount, delivery_address, needs_delivery, delivery_phone, created_at, updated_at) 
VALUES (
  'cmd-002-uuid-here',
  'client-uuid-2', 
  'CONFIRMED',
  45000.00,
  'Secteur 30, Avenue Kwame Nkrumah, Ouagadougou',
  true,
  '+22670654321',
  NOW(),
  NOW()
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
VALUES (
  'item-002-uuid',
  'cmd-002-uuid-here',
  'produit-vendeur-615c948e',  -- Produit appartenant au vendeur 615c948e-cb64-4eae-9c35-c45283a1ce16
  3,
  15000.00,
  45000.00
);
```

### Commande 3 - Livrée
```sql
INSERT INTO orders (id, client_id, status, total_amount, delivery_address, needs_delivery, delivery_phone, created_at, updated_at) 
VALUES (
  'cmd-003-uuid-here',
  'client-uuid-3', 
  'DELIVERED',
  18000.00,
  'Zone du Bois, Ouagadougou',
  false,
  '+22670987654',
  NOW() - INTERVAL 2 DAY,
  NOW()
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
VALUES (
  'item-003-uuid',
  'cmd-003-uuid-here',
  'produit-vendeur-615c948e',  -- Produit appartenant au vendeur 615c948e-cb64-4eae-9c35-c45283a1ce16
  1,
  18000.00,
  18000.00
);
```

## 🏪 Produits à Créer (si nécessaire)

```sql
-- Créer une boutique pour le vendeur
INSERT INTO boutiques (id, vendeur_id, nom, description, adresse, statut, created_at)
VALUES (
  'boutique-615c948e',
  '615c948e-cb64-4eae-9c35-c45283a1ce16',
  'Boutique Test Vendeur',
  'Boutique de test pour les commandes',
  'Ouagadougou, Burkina Faso',
  'ACTIVE',
  NOW()
);

-- Créer des produits pour ce vendeur
INSERT INTO produits (id, boutique_id, nom, description, prix, images, disponible, quantite_stock, categorie, created_at)
VALUES (
  'produit-vendeur-615c948e',
  'boutique-615c948e',
  'Produit Test Vendeur',
  'Produit de test pour les commandes vendeur',
  15000.00,
  '["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop"]',
  true,
  50,
  'Électronique',
  NOW()
);
```

## 🔧 Script Complet à Exécuter

```sql
-- 1. Créer la boutique
INSERT INTO boutiques (id, vendeur_id, nom, description, adresse, statut, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '615c948e-cb64-4eae-9c35-c45283a1ce16',
  'Boutique Test Vendeur',
  'Boutique de test pour les commandes',
  'Ouagadougou, Burkina Faso',
  'ACTIVE',
  NOW()
);

-- 2. Créer le produit
INSERT INTO produits (id, boutique_id, nom, description, prix, images, disponible, quantite_stock, categorie, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Smartphone Test',
  'Smartphone de test pour les commandes',
  25000.00,
  '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop"]',
  true,
  100,
  'Électronique',
  NOW()
);

-- 3. Créer les commandes
INSERT INTO orders (id, client_id, status, total_amount, delivery_address, needs_delivery, delivery_phone, created_at, updated_at) 
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440010', 
  'PENDING',
  50000.00,
  'Secteur 15, Rue 123, Ouagadougou',
  true,
  '+22670123456',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440011', 
  'CONFIRMED',
  25000.00,
  'Secteur 30, Avenue Kwame Nkrumah, Ouagadougou',
  true,
  '+22670654321',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440012', 
  'DELIVERED',
  75000.00,
  'Zone du Bois, Ouagadougou',
  false,
  '+22670987654',
  NOW() - INTERVAL 2 DAY,
  NOW()
);

-- 4. Créer les items de commande
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440002',
  2,
  25000.00,
  50000.00
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440002',
  1,
  25000.00,
  25000.00
),
(
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440002',
  3,
  25000.00,
  75000.00
);
```

## 📊 Résultat Attendu

Après avoir exécuté ce script, l'API `/api/vendeur/commandes` pour le vendeur `615c948e-cb64-4eae-9c35-c45283a1ce16` devrait retourner :

- **3 commandes**
- **1 en attente (PENDING)**
- **1 confirmée (CONFIRMED)** 
- **1 livrée (DELIVERED)**
- **Chiffre d'affaires total : 150 000 FCFA**

Exécutez ce script dans votre base de données, puis rechargez la page !