-- Script pour insérer des données de test avec clients et commandes
-- Exécuter dans PostgreSQL

-- Insérer des clients de test
INSERT INTO users (id, full_name, phone, email, password, role, is_active, is_verified, created_at) VALUES
(uuid_generate_v4(), 'Amadou Traoré', '+22670123456', 'amadou.traore@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT', true, true, NOW()),
(uuid_generate_v4(), 'Fatima Ouédraogo', '+22670234567', 'fatima.ouedraogo@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT', true, true, NOW()),
(uuid_generate_v4(), 'Ibrahim Sawadogo', '+22670345678', 'ibrahim.sawadogo@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT', true, true, NOW()),
(uuid_generate_v4(), 'Mariam Kaboré', '+22670456789', 'mariam.kabore@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT', true, true, NOW()),
(uuid_generate_v4(), 'Boukary Compaoré', '+22670567890', 'boukary.compaore@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT', true, true, NOW())
ON CONFLICT (phone) DO NOTHING;

-- Insérer des commandes de test (si des produits existent)
-- Récupérer les IDs des clients et produits pour créer des commandes
DO $$
DECLARE
    client_id UUID;
    product_id UUID;
    order_id UUID;
BEGIN
    -- Créer une commande pour Amadou Traoré
    SELECT id INTO client_id FROM users WHERE full_name = 'Amadou Traoré' LIMIT 1;
    
    IF client_id IS NOT NULL THEN
        -- Créer la commande
        INSERT INTO orders (id, client_id, status, total_amount, delivery_address, created_at, updated_at)
        VALUES (uuid_generate_v4(), client_id, 'PENDING', 15000.00, 'Secteur 15, Ouagadougou', NOW(), NOW())
        RETURNING id INTO order_id;
        
        -- Si des produits existent, créer des order_items
        SELECT id INTO product_id FROM products LIMIT 1;
        IF product_id IS NOT NULL THEN
            INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
            VALUES (uuid_generate_v4(), order_id, product_id, 2, 7500.00, 15000.00);
        END IF;
    END IF;
    
    -- Créer une commande pour Fatima Ouédraogo
    SELECT id INTO client_id FROM users WHERE full_name = 'Fatima Ouédraogo' LIMIT 1;
    
    IF client_id IS NOT NULL THEN
        INSERT INTO orders (id, client_id, status, total_amount, delivery_address, created_at, updated_at)
        VALUES (uuid_generate_v4(), client_id, 'CONFIRMED', 25000.00, 'Zone du Bois, Ouagadougou', NOW() - INTERVAL '1 day', NOW());
    END IF;
    
    -- Créer une commande pour Ibrahim Sawadogo
    SELECT id INTO client_id FROM users WHERE full_name = 'Ibrahim Sawadogo' LIMIT 1;
    
    IF client_id IS NOT NULL THEN
        INSERT INTO orders (id, client_id, status, total_amount, delivery_address, created_at, updated_at)
        VALUES (uuid_generate_v4(), client_id, 'DELIVERED', 12500.00, 'Cissin, Ouagadougou', NOW() - INTERVAL '2 days', NOW());
    END IF;
END $$;

-- Vérifier les commandes créées
SELECT 
    o.id,
    u.full_name as client_name,
    o.status,
    o.total_amount,
    o.delivery_address,
    o.created_at
FROM orders o
JOIN users u ON o.client_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;