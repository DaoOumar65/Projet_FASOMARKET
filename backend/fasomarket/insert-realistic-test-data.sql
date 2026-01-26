-- Script pour insérer des données de test réalistes
-- Exécuter dans PostgreSQL

-- Insérer un client de test
INSERT INTO users (id, full_name, phone, email, password, role, is_active, is_verified, created_at) VALUES
('4591f5a0-1234-4567-8901-123456789012', 'Dao Test', '+22670111222', 'dao.test@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT', true, true, '2026-01-16 12:31:27')
ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Insérer un vendeur de test
INSERT INTO users (id, full_name, phone, email, password, role, is_active, is_verified, created_at) VALUES
('5591f5a0-1234-4567-8901-123456789013', 'Vendeur Test', '+22670222333', 'vendeur.test@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VENDOR', true, true, NOW())
ON CONFLICT (phone) DO NOTHING;

-- Insérer le profil vendeur
INSERT INTO vendors (id, user_id, status, carte_identite, created_at) 
SELECT uuid_generate_v4(), u.id, 'COMPTE_VALIDE', 'TEST123456', NOW()
FROM users u WHERE u.phone = '+22670222333'
ON CONFLICT DO NOTHING;

-- Insérer une boutique de test
INSERT INTO shops (id, vendor_id, name, description, phone, address, status, created_at, updated_at)
SELECT uuid_generate_v4(), v.id, 'Boutique Test', 'Boutique de test', '+22670222333', 'Ouagadougou', 'ACTIVE', NOW(), NOW()
FROM vendors v 
JOIN users u ON v.user_id = u.id 
WHERE u.phone = '+22670222333'
ON CONFLICT (name) DO NOTHING;

-- Insérer des produits de test
DO $$
DECLARE
    shop_id UUID;
    product1_id UUID := uuid_generate_v4();
    product2_id UUID := uuid_generate_v4();
    product3_id UUID := uuid_generate_v4();
BEGIN
    -- Récupérer l'ID de la boutique
    SELECT s.id INTO shop_id 
    FROM shops s 
    WHERE s.name = 'Boutique Test' 
    LIMIT 1;
    
    IF shop_id IS NOT NULL THEN
        -- Insérer les produits
        INSERT INTO products (id, shop_id, name, description, price, stock_quantity, is_active, available, status, created_at, updated_at) VALUES
        (product1_id, shop_id, 'Smartphone Samsung', 'Téléphone Android dernière génération', 250000.00, 10, true, true, 'ACTIVE', NOW(), NOW()),
        (product2_id, shop_id, 'Écouteurs Bluetooth', 'Écouteurs sans fil haute qualité', 45000.00, 25, true, true, 'ACTIVE', NOW(), NOW()),
        (product3_id, shop_id, 'Chargeur Rapide', 'Chargeur USB-C 65W', 15000.00, 50, true, true, 'ACTIVE', NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        -- Créer une commande de test
        INSERT INTO orders (id, client_id, status, total_amount, delivery_address, created_at, updated_at)
        VALUES ('4591f5a0-4567-8901-2345-123456789012', '4591f5a0-1234-4567-8901-123456789012', 'CONFIRMED', 2025000.00, 'Secteur 30, Ouagadougou', '2026-01-16 12:31:27', NOW())
        ON CONFLICT DO NOTHING;
        
        -- Créer les items de commande
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES
        (uuid_generate_v4(), '4591f5a0-4567-8901-2345-123456789012', product1_id, 5, 250000.00, 1250000.00),
        (uuid_generate_v4(), '4591f5a0-4567-8901-2345-123456789012', product2_id, 10, 45000.00, 450000.00),
        (uuid_generate_v4(), '4591f5a0-4567-8901-2345-123456789012', product3_id, 13, 25000.00, 325000.00)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Vérifier les données créées
SELECT 
    'CMD-' || SUBSTRING(o.id::text, 1, 6) as commande_ref,
    o.created_at,
    u.full_name as client_name,
    o.total_amount,
    COUNT(oi.id) as nb_articles,
    o.status
FROM orders o
JOIN users u ON o.client_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = '4591f5a0-4567-8901-2345-123456789012'
GROUP BY o.id, u.full_name, o.total_amount, o.status, o.created_at;