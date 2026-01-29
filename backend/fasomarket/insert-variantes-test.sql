-- Script pour créer des variantes de test pour les produits existants
-- Ce script récupère les produits existants et crée des variantes pour eux

-- Créer la table si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS produit_variantes (
    id BIGSERIAL PRIMARY KEY,
    produit_id UUID NOT NULL,
    couleur VARCHAR(100),
    taille VARCHAR(50),
    modele VARCHAR(100),
    prix_ajustement DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- Insérer des variantes pour les produits existants
-- Remplacez les UUID par ceux de vos produits existants

-- Exemple pour un produit de vêtement
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Rouge',
    'M',
    'Standard',
    15000,
    10,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-RO-M-', EXTRACT(EPOCH FROM NOW())::bigint)
FROM produits p 
WHERE p.nom ILIKE '%chemise%' OR p.nom ILIKE '%t-shirt%' OR p.nom ILIKE '%pantalon%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Rouge',
    'L',
    'Standard',
    15000,
    5,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-RO-L-', EXTRACT(EPOCH FROM NOW())::bigint + 1)
FROM produits p 
WHERE p.nom ILIKE '%chemise%' OR p.nom ILIKE '%t-shirt%' OR p.nom ILIKE '%pantalon%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Bleu',
    'M',
    'Standard',
    16000,
    8,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-BL-M-', EXTRACT(EPOCH FROM NOW())::bigint + 2)
FROM produits p 
WHERE p.nom ILIKE '%chemise%' OR p.nom ILIKE '%t-shirt%' OR p.nom ILIKE '%pantalon%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Bleu',
    'L',
    'Standard',
    16000,
    3,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-BL-L-', EXTRACT(EPOCH FROM NOW())::bigint + 3)
FROM produits p 
WHERE p.nom ILIKE '%chemise%' OR p.nom ILIKE '%t-shirt%' OR p.nom ILIKE '%pantalon%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Noir',
    'M',
    'Standard',
    17000,
    12,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-NO-M-', EXTRACT(EPOCH FROM NOW())::bigint + 4)
FROM produits p 
WHERE p.nom ILIKE '%chemise%' OR p.nom ILIKE '%t-shirt%' OR p.nom ILIKE '%pantalon%'
LIMIT 1;

-- Variantes pour produits alimentaires (sans taille, avec modèle)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    NULL,
    NULL,
    'Bio',
    2000,
    20,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-BIO-', EXTRACT(EPOCH FROM NOW())::bigint + 5)
FROM produits p 
WHERE p.nom ILIKE '%riz%' OR p.nom ILIKE '%mil%' OR p.nom ILIKE '%haricot%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    NULL,
    NULL,
    'Standard',
    0,
    15,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-STD-', EXTRACT(EPOCH FROM NOW())::bigint + 6)
FROM produits p 
WHERE p.nom ILIKE '%riz%' OR p.nom ILIKE '%mil%' OR p.nom ILIKE '%haricot%'
LIMIT 1;

-- Variantes pour produits électroniques (couleur uniquement)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Noir',
    NULL,
    'Standard',
    0,
    5,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-NO-STD-', EXTRACT(EPOCH FROM NOW())::bigint + 7)
FROM produits p 
WHERE p.nom ILIKE '%téléphone%' OR p.nom ILIKE '%ordinateur%' OR p.nom ILIKE '%tablette%'
LIMIT 1;

INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) 
SELECT 
    p.id,
    'Blanc',
    NULL,
    'Standard',
    5000,
    3,
    CONCAT(SUBSTRING(p.id::text, 1, 8), '-BL-STD-', EXTRACT(EPOCH FROM NOW())::bigint + 8)
FROM produits p 
WHERE p.nom ILIKE '%téléphone%' OR p.nom ILIKE '%ordinateur%' OR p.nom ILIKE '%tablette%'
LIMIT 1;

-- Afficher les variantes créées
SELECT 
    pv.*,
    p.nom as nom_produit
FROM produit_variantes pv
JOIN produits p ON pv.produit_id = p.id
ORDER BY pv.created_at DESC;