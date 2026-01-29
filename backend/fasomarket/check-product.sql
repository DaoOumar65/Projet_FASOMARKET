-- Vérifier l'existence du produit
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    p.is_active,
    s.id as shop_id,
    s.name as shop_name,
    s.status as shop_status,
    v.id as vendor_id,
    u.id as user_id,
    u.full_name as vendor_name
FROM products p
LEFT JOIN shops s ON p.shop_id = s.id
LEFT JOIN vendors v ON s.vendor_id = v.id
LEFT JOIN users u ON v.user_id = u.id
WHERE p.id = '8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf';

-- Vérifier tous les produits
SELECT COUNT(*) as total_products FROM products;

-- Vérifier les 5 derniers produits
SELECT 
    p.id,
    p.name,
    p.created_at,
    s.name as shop_name
FROM products p
LEFT JOIN shops s ON p.shop_id = s.id
ORDER BY p.created_at DESC
LIMIT 5;