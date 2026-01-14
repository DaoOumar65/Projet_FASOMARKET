-- Vérifier la commande existante
SELECT o.id, o.status, o.total_amount, o.delivery_address, 
       u.full_name as client_name, u.id as client_id
FROM orders o
JOIN users u ON o.client_id = u.id;

-- Vérifier les items de la commande
SELECT oi.id, oi.quantity, oi.unit_price, oi.total_price,
       p.name as product_name, p.id as product_id
FROM order_items oi
JOIN products p ON oi.product_id = p.id;

-- Vérifier le lien produit -> boutique -> vendeur
SELECT p.id as product_id, p.name as product_name,
       s.id as shop_id, s.name as shop_name,
       v.id as vendor_id,
       u.id as user_id, u.full_name as vendor_name
FROM products p
JOIN shops s ON p.shop_id = s.id
JOIN vendors v ON s.vendor_id = v.id
JOIN users u ON v.user_id = u.id;

-- Vérifier si la commande a des order_items
SELECT COUNT(*) as order_items_count FROM order_items;
