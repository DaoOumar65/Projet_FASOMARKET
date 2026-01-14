-- Script d'initialisation de la base de données FasoMarket
-- Exécuter ce script dans PostgreSQL

-- Créer la base de données
CREATE DATABASE fasomarket;

-- Se connecter à la base de données
\c fasomarket;

-- Créer l'extension UUID si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Les tables seront créées automatiquement par Hibernate
-- Mais voici la structure pour référence :

/*
-- Table users (créée automatiquement)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CLIENT', 'VENDOR', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table vendors (créée automatiquement)
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    id_card VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
*/

-- Insérer un admin par défaut (optionnel)
-- Mot de passe: admin123 (hashé avec BCrypt)
INSERT INTO users (id, full_name, phone, email, password, role, is_active, is_verified) 
VALUES (
    uuid_generate_v4(),
    'Administrateur',
    '+22670000000',
    'admin@fasomarket.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ADMIN',
    true,
    true
) ON CONFLICT (phone) DO NOTHING;