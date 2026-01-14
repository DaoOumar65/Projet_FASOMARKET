-- Script pour créer une commande de test visible par le vendeur

-- 1. Récupérer l'ID du client et du vendeur
-- SELECT id, full_name, role FROM users WHERE role IN ('CLIENT', 'VENDOR');

-- 2. Récupérer l'ID d'un produit du vendeur
-- SELECT p.id, p.name, p.price, s.name as shop_name, u.full_name as vendor_name
-- FROM products p
-- JOIN shops s ON p.shop_id = s.id
-- JOIN vendors v ON s.vendor_id = v.id
-- JOIN users u ON v.user_id = u.id;

-- 3. Créer une commande de test (remplacer les UUIDs)
-- INSERT INTO orders (id, client_id, status, total_amount, delivery_address, needs_delivery, delivery_phone, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   '<CLIENT_UUID>',
--   'PENDING',
--   45000.00,
--   'Secteur 15, Ouagadougou',
--   true,
--   '+22670123456',
--   NOW(),
--   NOW()
-- );

-- 4. Créer les items de commande (remplacer les UUIDs)
-- INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
-- VALUES (
--   gen_random_uuid(),
--   '<ORDER_UUID>',
--   '<PRODUCT_UUID>',
--   2,
--   45000.00,
--   90000.00
-- );

-- INSTRUCTIONS:
-- 1. Connectez-vous à PostgreSQL: psql -U postgres -d fasomarket
-- 2. Exécutez les SELECT pour obtenir les UUIDs
-- 3. Remplacez les <UUID> dans les INSERT
-- 4. Exécutez les INSERT
-- 5. Rafraîchissez le dashboard vendeur
