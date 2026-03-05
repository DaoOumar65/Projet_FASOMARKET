-- ============================================
-- REQUÊTES SQL - DEBUG SYSTÈME DE PAIEMENT
-- ============================================

-- 1. Voir tous les paiements récents
SELECT 
    p.id,
    p.transaction_id,
    p.amount,
    p.status,
    p.payment_method,
    p.payment_date,
    p.created_at,
    o.id as order_id,
    o.status as order_status,
    u.full_name as client_name
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN users u ON o.client_id = u.id
ORDER BY p.created_at DESC
LIMIT 20;

-- 2. Paiements en attente (PENDING)
SELECT 
    p.transaction_id,
    p.amount,
    p.created_at,
    o.id as order_id,
    u.full_name as client
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN users u ON o.client_id = u.id
WHERE p.status = 'PENDING'
ORDER BY p.created_at DESC;

-- 3. Paiements échoués
SELECT 
    p.transaction_id,
    p.amount,
    p.created_at,
    o.id as order_id,
    u.full_name as client
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN users u ON o.client_id = u.id
WHERE p.status = 'FAILED'
ORDER BY p.created_at DESC;

-- 4. Statistiques des paiements
SELECT 
    p.status,
    COUNT(*) as nombre,
    SUM(p.amount) as montant_total,
    AVG(p.amount) as montant_moyen
FROM payments p
GROUP BY p.status;

-- 5. Commandes sans paiement
SELECT 
    o.id,
    o.total_amount,
    o.status,
    o.created_at,
    u.full_name as client
FROM orders o
JOIN users u ON o.client_id = u.id
LEFT JOIN payments p ON p.order_id = o.id
WHERE p.id IS NULL
  AND o.status = 'PENDING'
ORDER BY o.created_at DESC;

-- 6. Vérifier une commande spécifique
-- Remplacer 'COMMANDE_ID' par l'ID réel
SELECT 
    o.id as order_id,
    o.status as order_status,
    o.total_amount,
    o.created_at as order_date,
    p.id as payment_id,
    p.transaction_id,
    p.status as payment_status,
    p.amount as payment_amount,
    p.payment_method,
    p.payment_date,
    u.full_name as client,
    u.phone as client_phone
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id
JOIN users u ON o.client_id = u.id
WHERE o.id = 'COMMANDE_ID';

-- 7. Historique paiements d'un client
-- Remplacer 'CLIENT_ID' par l'ID réel
SELECT 
    p.transaction_id,
    p.amount,
    p.status,
    p.payment_method,
    p.payment_date,
    p.created_at,
    o.id as order_id,
    o.status as order_status
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE o.client_id = 'CLIENT_ID'
ORDER BY p.created_at DESC;

-- 8. Paiements du jour
SELECT 
    COUNT(*) as nombre_paiements,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as reussis,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as echoues,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as en_attente,
    SUM(amount) as montant_total
FROM payments
WHERE DATE(created_at) = CURRENT_DATE;

-- 9. Taux de réussite des paiements (7 derniers jours)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as reussis,
    ROUND(100.0 * SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) / COUNT(*), 2) as taux_reussite
FROM payments
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 10. Paiements par méthode
SELECT 
    payment_method,
    COUNT(*) as nombre,
    SUM(amount) as montant_total,
    AVG(amount) as montant_moyen
FROM payments
GROUP BY payment_method
ORDER BY nombre DESC;

-- 11. Nettoyer les paiements test (ATTENTION: À utiliser avec précaution)
-- DELETE FROM payments WHERE transaction_id LIKE 'test_paydunya_%';

-- 12. Réinitialiser une commande pour nouveau test
-- Remplacer 'COMMANDE_ID' par l'ID réel
-- UPDATE orders SET status = 'PENDING' WHERE id = 'COMMANDE_ID';
-- DELETE FROM payments WHERE order_id = 'COMMANDE_ID';

-- 13. Vérifier l'intégrité des données
SELECT 
    'Commandes payées sans paiement' as probleme,
    COUNT(*) as nombre
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'COMPLETED'
WHERE o.status = 'PAID' AND p.id IS NULL
UNION ALL
SELECT 
    'Paiements complétés avec commande non payée' as probleme,
    COUNT(*) as nombre
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE p.status = 'COMPLETED' AND o.status != 'PAID';

-- 14. Temps moyen de paiement
SELECT 
    AVG(EXTRACT(EPOCH FROM (p.payment_date - p.created_at))) / 60 as minutes_moyennes
FROM payments p
WHERE p.status = 'COMPLETED' 
  AND p.payment_date IS NOT NULL;

-- 15. Top 10 clients par montant payé
SELECT 
    u.full_name,
    u.phone,
    COUNT(p.id) as nombre_paiements,
    SUM(p.amount) as montant_total
FROM payments p
JOIN orders o ON p.order_id = o.id
JOIN users u ON o.client_id = u.id
WHERE p.status = 'COMPLETED'
GROUP BY u.id, u.full_name, u.phone
ORDER BY montant_total DESC
LIMIT 10;
