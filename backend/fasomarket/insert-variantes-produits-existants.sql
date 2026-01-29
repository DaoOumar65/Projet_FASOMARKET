-- Script pour créer des variantes basées sur les produits existants
-- Utilise les vrais IDs de vos produits

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
    FOREIGN KEY (produit_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Variantes pour Boubou Elegant (cde12486-1561-415e-9b4e-5fa3be2342a1)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Blanc', 'M', 'Standard', 0, 8, 'CDE12486-BL-M-' || EXTRACT(EPOCH FROM NOW())::bigint),
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Blanc', 'L', 'Standard', 0, 6, 'CDE12486-BL-L-' || EXTRACT(EPOCH FROM NOW())::bigint + 1),
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Bleu', 'M', 'Standard', 2000, 5, 'CDE12486-BL-M-' || EXTRACT(EPOCH FROM NOW())::bigint + 2),
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Bleu', 'L', 'Standard', 2000, 4, 'CDE12486-BL-L-' || EXTRACT(EPOCH FROM NOW())::bigint + 3),
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Vert', 'XL', 'Premium', 5000, 2, 'CDE12486-VE-XL-' || EXTRACT(EPOCH FROM NOW())::bigint + 4);

-- Variantes pour iPhone 12 Pro (8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf', 'Noir', NULL, '128GB', 0, 5, '8442CCBC-NO-128-' || EXTRACT(EPOCH FROM NOW())::bigint + 5),
('8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf', 'Blanc', NULL, '128GB', 5000, 4, '8442CCBC-BL-128-' || EXTRACT(EPOCH FROM NOW())::bigint + 6),
('8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf', 'Bleu', NULL, '256GB', 25000, 3, '8442CCBC-BL-256-' || EXTRACT(EPOCH FROM NOW())::bigint + 7),
('8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf', 'Rouge', NULL, '512GB', 50000, 2, '8442CCBC-RO-512-' || EXTRACT(EPOCH FROM NOW())::bigint + 8);

-- Variantes pour Chaussette (5b0e5b35-6a7e-4feb-a051-280dc8b111ac)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('5b0e5b35-6a7e-4feb-a051-280dc8b111ac', 'Blanc', '39-42', 'Standard', 0, 15, '5B0E5B35-BL-39-' || EXTRACT(EPOCH FROM NOW())::bigint + 9),
('5b0e5b35-6a7e-4feb-a051-280dc8b111ac', 'Noir', '39-42', 'Standard', 0, 12, '5B0E5B35-NO-39-' || EXTRACT(EPOCH FROM NOW())::bigint + 10),
('5b0e5b35-6a7e-4feb-a051-280dc8b111ac', 'Gris', '43-46', 'Sport', 100, 8, '5B0E5B35-GR-43-' || EXTRACT(EPOCH FROM NOW())::bigint + 11);

-- Variantes pour iPhone 15 Pro Max (d8a9444e-b5b3-4402-b3d7-904cb3b043cd)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('d8a9444e-b5b3-4402-b3d7-904cb3b043cd', 'Titane Naturel', NULL, '128GB', 0, 3, 'D8A9444E-TN-128-' || EXTRACT(EPOCH FROM NOW())::bigint + 12),
('d8a9444e-b5b3-4402-b3d7-904cb3b043cd', 'Titane Bleu', NULL, '256GB', 50000, 2, 'D8A9444E-TB-256-' || EXTRACT(EPOCH FROM NOW())::bigint + 13),
('d8a9444e-b5b3-4402-b3d7-904cb3b043cd', 'Titane Blanc', NULL, '512GB', 100000, 2, 'D8A9444E-TB-512-' || EXTRACT(EPOCH FROM NOW())::bigint + 14),
('d8a9444e-b5b3-4402-b3d7-904cb3b043cd', 'Titane Noir', NULL, '1TB', 150000, 1, 'D8A9444E-TN-1TB-' || EXTRACT(EPOCH FROM NOW())::bigint + 15);

-- Variantes pour Pantalon Bogolan (c1c25f2e-b263-44d1-a752-454849ff6063)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('c1c25f2e-b263-44d1-a752-454849ff6063', 'Noir', 'S', 'Standard', 0, 4, 'C1C25F2E-NO-S-' || EXTRACT(EPOCH FROM NOW())::bigint + 16),
('c1c25f2e-b263-44d1-a752-454849ff6063', 'Noir', 'M', 'Standard', 0, 3, 'C1C25F2E-NO-M-' || EXTRACT(EPOCH FROM NOW())::bigint + 17),
('c1c25f2e-b263-44d1-a752-454849ff6063', 'Marron', 'L', 'Premium', 3000, 2, 'C1C25F2E-MA-L-' || EXTRACT(EPOCH FROM NOW())::bigint + 18),
('c1c25f2e-b263-44d1-a752-454849ff6063', 'Beige', 'XL', 'Premium', 3000, 3, 'C1C25F2E-BE-XL-' || EXTRACT(EPOCH FROM NOW())::bigint + 19);

-- Variantes pour Chemise Traditionnelle (a5309966-df13-4556-b4b6-1005ebe1f51d)
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('a5309966-df13-4556-b4b6-1005ebe1f51d', 'Blanc', 'S', 'Standard', 0, 1, 'A5309966-BL-S-' || EXTRACT(EPOCH FROM NOW())::bigint + 20),
('a5309966-df13-4556-b4b6-1005ebe1f51d', 'Noir', 'M', 'Standard', 0, 0, 'A5309966-NO-M-' || EXTRACT(EPOCH FROM NOW())::bigint + 21),
('a5309966-df13-4556-b4b6-1005ebe1f51d', 'Bleu', 'L', 'Premium', 2000, 0, 'A5309966-BL-L-' || EXTRACT(EPOCH FROM NOW())::bigint + 22),
('a5309966-df13-4556-b4b6-1005ebe1f51d', 'Rouge', 'XL', 'Premium', 2000, 0, 'A5309966-RO-XL-' || EXTRACT(EPOCH FROM NOW())::bigint + 23);

-- Vérifier les variantes créées
SELECT 
    pv.id,
    pv.couleur,
    pv.taille,
    pv.modele,
    pv.prix_ajustement,
    pv.stock,
    pv.sku,
    p.name as nom_produit
FROM produit_variantes pv
JOIN products p ON pv.produit_id = p.id
ORDER BY p.name, pv.couleur, pv.taille;