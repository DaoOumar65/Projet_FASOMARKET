-- Script pour ajouter un email à l'utilisateur Dissa Haroun
-- Exécuter dans PostgreSQL

-- Mettre à jour l'utilisateur Dissa Haroun avec un email
UPDATE users 
SET email = 'dissa.haroun@fasomarket.com'
WHERE full_name = 'Dissa Haroun' 
  AND phone = '+22625252521';

-- Vérifier la mise à jour
SELECT id, full_name, phone, email, role, is_active 
FROM users 
WHERE full_name = 'Dissa Haroun';

-- Si l'utilisateur n'existe pas encore, l'insérer avec l'email
INSERT INTO users (full_name, phone, email, password, role, is_active, is_verified)
VALUES (
    'Dissa Haroun',
    '+22625252521', 
    'dissa.haroun@fasomarket.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- mot de passe: password123
    'VENDOR',
    true,
    false
) ON CONFLICT (phone) DO UPDATE SET 
    email = EXCLUDED.email;

-- Créer le profil vendeur si nécessaire
INSERT INTO vendors (user_id, status, carte_identite, created_at)
SELECT u.id, 'EN_ATTENTE_VALIDATION', 'B20202020', CURRENT_TIMESTAMP
FROM users u 
WHERE u.full_name = 'Dissa Haroun' AND u.phone = '+22625252521'
ON CONFLICT DO NOTHING;