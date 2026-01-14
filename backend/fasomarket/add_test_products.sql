-- Script SQL pour ajouter des produits de test à MaroShop
-- À exécuter dans PostgreSQL

-- 1. Vérifier que la boutique existe
SELECT id, name, status FROM shops WHERE id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';

-- 2. Supprimer les anciens produits de test (optionnel)
DELETE FROM products WHERE shop_id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';

-- 3. Ajouter 3 produits de test avec toutes les données nécessaires
INSERT INTO products (
    id, 
    shop_id, 
    name, 
    description, 
    price, 
    stock_quantity, 
    category, 
    images, 
    status, 
    is_active, 
    available, 
    featured, 
    discount, 
    rating, 
    reviews_count, 
    min_order_quantity, 
    sales_count, 
    views_count, 
    created_at, 
    updated_at
)
VALUES 
-- Produit 1: Chemise Traditionnelle
(
    gen_random_uuid(),
    '763c6363-1129-4da6-9bdb-dad7b4b54bda',
    'Chemise Traditionnelle',
    'Belle chemise en coton traditionnel, confortable et élégante pour toutes occasions',
    15000.00,
    10,
    'Mode',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    'ACTIVE',
    true,
    true,
    false,
    0.00,
    0.00,
    0,
    1,
    0,
    0,
    NOW(),
    NOW()
),
-- Produit 2: Pantalon Bogolan
(
    gen_random_uuid(),
    '763c6363-1129-4da6-9bdb-dad7b4b54bda',
    'Pantalon Bogolan',
    'Pantalon en tissu bogolan authentique, motifs traditionnels burkinabè',
    25000.00,
    5,
    'Mode',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    'ACTIVE',
    true,
    true,
    false,
    0.00,
    0.00,
    0,
    1,
    0,
    0,
    NOW(),
    NOW()
),
-- Produit 3: Boubou Élégant
(
    gen_random_uuid(),
    '763c6363-1129-4da6-9bdb-dad7b4b54bda',
    'Boubou Élégant',
    'Boubou brodé pour occasions spéciales, tissu de qualité supérieure',
    45000.00,
    3,
    'Mode',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    'ACTIVE',
    true,
    true,
    true,
    0.00,
    0.00,
    0,
    1,
    0,
    0,
    NOW(),
    NOW()
);

-- 4. Vérifier que les produits ont été ajoutés
SELECT 
    id, 
    name, 
    price, 
    stock_quantity, 
    is_active, 
    available,
    status
FROM products 
WHERE shop_id = '763c6363-1129-4da6-9bdb-dad7b4b54bda';

-- 5. Compter les produits actifs
SELECT COUNT(*) as total_produits_actifs
FROM products 
WHERE shop_id = '763c6363-1129-4da6-9bdb-dad7b4b54bda' 
  AND is_active = true 
  AND status = 'ACTIVE';
