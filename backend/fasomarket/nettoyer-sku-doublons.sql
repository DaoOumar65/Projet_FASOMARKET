-- Nettoyer les SKU dupliqués dans produit_variantes
-- Supprimer les doublons en gardant seulement le plus récent

-- 1. Identifier les SKU dupliqués
SELECT sku, COUNT(*) as nb_doublons 
FROM produit_variantes 
GROUP BY sku 
HAVING COUNT(*) > 1;

-- 2. Supprimer les doublons (garder seulement le plus récent)
DELETE FROM produit_variantes 
WHERE id NOT IN (
    SELECT DISTINCT ON (sku) id 
    FROM produit_variantes 
    ORDER BY sku, created_at DESC
);

-- 3. Vérifier qu'il n'y a plus de doublons
SELECT sku, COUNT(*) as nb_doublons 
FROM produit_variantes 
GROUP BY sku 
HAVING COUNT(*) > 1;