-- Script pour créer les catégories prédéfinies de FasoMarket
-- Exécuter dans PostgreSQL

-- Supprimer les catégories existantes si nécessaire
-- DELETE FROM categories;

-- Insérer les catégories principales
INSERT INTO categories (id, name, description, icon, is_active, created_at) VALUES
(gen_random_uuid(), 'Mode', 'Vêtements, chaussures et accessoires de mode', '👗', true, NOW()),
(gen_random_uuid(), 'Electronique', 'Téléphones, ordinateurs, électroménager', '📱', true, NOW()),
(gen_random_uuid(), 'Cosmétiques', 'Produits de beauté et soins personnels', '💄', true, NOW()),
(gen_random_uuid(), 'Alimentaire', 'Produits alimentaires et boissons', '🍎', true, NOW()),
(gen_random_uuid(), 'Maison', 'Meubles, décoration et équipement maison', '🏠', true, NOW()),
(gen_random_uuid(), 'Sport', 'Équipements et vêtements de sport', '⚽', true, NOW()),
(gen_random_uuid(), 'Santé', 'Produits pharmaceutiques et de santé', '💊', true, NOW()),
(gen_random_uuid(), 'Automobile', 'Pièces et accessoires automobiles', '🚗', true, NOW()),
(gen_random_uuid(), 'Livres', 'Livres, magazines et matériel éducatif', '📚', true, NOW()),
(gen_random_uuid(), 'Jouets', 'Jouets et jeux pour enfants', '🧸', true, NOW());

-- Vérifier les catégories créées
SELECT id, name, description, icon, is_active 
FROM categories 
ORDER BY name;