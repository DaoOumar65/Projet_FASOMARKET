-- Script de création de la table produit_variantes
CREATE TABLE IF NOT EXISTS produit_variantes (
    id BIGSERIAL PRIMARY KEY,
    produit_id UUID NOT NULL,
    couleur VARCHAR(100),
    taille VARCHAR(50),
    modele VARCHAR(100),
    poids DECIMAL(10,2),
    dimensions VARCHAR(255),
    materiau VARCHAR(100),
    finition VARCHAR(100),
    capacite VARCHAR(50),
    puissance VARCHAR(50),
    parfum VARCHAR(100),
    age_cible VARCHAR(50),
    genre VARCHAR(20),
    saison VARCHAR(20),
    prix_ajustement DECIMAL(10,2) DEFAULT 0.00,
    stock INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_produit_variantes_produit_id ON produit_variantes(produit_id);
CREATE INDEX IF NOT EXISTS idx_produit_variantes_sku ON produit_variantes(sku);