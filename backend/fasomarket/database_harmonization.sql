-- Script d'harmonisation de la base de données FasoMarket
-- Exécuter après les modifications du code

-- 1. Ajouter les nouvelles colonnes à la table shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS numero_cnib VARCHAR(20);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS fichier_ifu VARCHAR(500);

-- 2. Supprimer la contrainte d'email obligatoire pour les clients
-- (Déjà géré au niveau application)

-- 3. Mettre à jour les données existantes si nécessaire
-- Exemple: mettre des valeurs par défaut pour les boutiques existantes
UPDATE shops SET numero_cnib = 'B00000000' WHERE numero_cnib IS NULL;
UPDATE shops SET fichier_ifu = 'ifu_default.pdf' WHERE fichier_ifu IS NULL;

-- 4. Nettoyer les données de test obsolètes
-- Supprimer les anciens vendeurs de test avec carte d'identité
DELETE FROM vendors WHERE id_card IS NOT NULL;

-- 5. Vérifier l'intégrité des données
SELECT 
    'Clients sans email' as type, 
    COUNT(*) as count 
FROM users 
WHERE role = 'CLIENT' AND email IS NULL

UNION ALL

SELECT 
    'Vendeurs sans email' as type, 
    COUNT(*) as count 
FROM users 
WHERE role = 'VENDOR' AND email IS NULL

UNION ALL

SELECT 
    'Boutiques sans CNIB' as type, 
    COUNT(*) as count 
FROM shops 
WHERE numero_cnib IS NULL

UNION ALL

SELECT 
    'Boutiques sans IFU' as type, 
    COUNT(*) as count 
FROM shops 
WHERE fichier_ifu IS NULL;

-- 6. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_shops_numero_cnib ON shops(numero_cnib);
CREATE INDEX IF NOT EXISTS idx_shops_fichier_ifu ON shops(fichier_ifu);