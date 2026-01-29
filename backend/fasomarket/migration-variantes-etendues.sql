-- Script pour ajouter les nouvelles colonnes de variantes
-- Exécuter dans PostgreSQL

-- Ajouter les nouvelles colonnes à la table produit_variantes
ALTER TABLE produit_variantes 
ADD COLUMN IF NOT EXISTS poids DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100),
ADD COLUMN IF NOT EXISTS materiau VARCHAR(100),
ADD COLUMN IF NOT EXISTS finition VARCHAR(100),
ADD COLUMN IF NOT EXISTS capacite VARCHAR(50),
ADD COLUMN IF NOT EXISTS puissance VARCHAR(50),
ADD COLUMN IF NOT EXISTS parfum VARCHAR(100),
ADD COLUMN IF NOT EXISTS age_cible VARCHAR(50),
ADD COLUMN IF NOT EXISTS genre VARCHAR(20),
ADD COLUMN IF NOT EXISTS saison VARCHAR(20);

-- Créer des index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_variantes_couleur ON produit_variantes(couleur);
CREATE INDEX IF NOT EXISTS idx_variantes_taille ON produit_variantes(taille);
CREATE INDEX IF NOT EXISTS idx_variantes_genre ON produit_variantes(genre);
CREATE INDEX IF NOT EXISTS idx_variantes_capacite ON produit_variantes(capacite);
CREATE INDEX IF NOT EXISTS idx_variantes_materiau ON produit_variantes(materiau);

-- Exemples de variantes étendues pour test
-- Variantes vêtements avec genre et saison
INSERT INTO produit_variantes (produit_id, couleur, taille, genre, saison, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Noir',
    'M',
    'Homme',
    'Été',
    0,
    5,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-NO-M-HE-', EXTRACT(EPOCH FROM NOW())::bigint)
FROM products p 
WHERE p.category ILIKE '%mode%' OR p.category ILIKE '%vêtement%'
LIMIT 1;

-- Variantes électronique avec capacité
INSERT INTO produit_variantes (produit_id, couleur, capacite, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Noir',
    '128GB',
    0,
    3,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-NO-128-', EXTRACT(EPOCH FROM NOW())::bigint)
FROM products p 
WHERE p.category ILIKE '%electronique%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, capacite, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Blanc',
    '256GB',
    50000,
    2,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-BL-256-', EXTRACT(EPOCH FROM NOW())::bigint + 1)
FROM products p 
WHERE p.category ILIKE '%electronique%'
LIMIT 1;

-- Variantes cosmétiques avec parfum et finition
INSERT INTO produit_variantes (produit_id, parfum, finition, genre, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Vanille',
    'Mat',
    'Femme',
    0,
    8,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-VA-MA-', EXTRACT(EPOCH FROM NOW())::bigint + 2)
FROM products p 
WHERE p.category ILIKE '%cosmétique%' OR p.category ILIKE '%beauté%'
LIMIT 1;

-- Variantes alimentaire avec poids
INSERT INTO produit_variantes (produit_id, poids, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    1.0,
    'Bio',
    2000,
    10,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-1KG-BIO-', EXTRACT(EPOCH FROM NOW())::bigint + 3)
FROM products p 
WHERE p.category ILIKE '%alimentaire%'
LIMIT 1;

-- Variantes maison avec matériau
INSERT INTO produit_variantes (produit_id, couleur, materiau, finition, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Blanc',
    'Bois',
    'Mat',
    10000,
    4,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-BL-BO-', EXTRACT(EPOCH FROM NOW())::bigint + 4)
FROM products p 
WHERE p.category ILIKE '%maison%' OR p.category ILIKE '%décoration%'
LIMIT 1;

-- Vérifier les nouvelles variantes créées
SELECT 
    pv.id,
    pv.couleur,
    pv.taille,
    pv.modele,
    pv.prix_ajustement,
    pv.stock,
    pv.sku,
    p.name as nom_produit,
    p.category as categorie
FROM produit_variantes pv
JOIN products p ON pv.produit_id = p.id
ORDER BY p.category, p.name;