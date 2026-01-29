-- Test rapide pour créer des variantes avec vos produits existants
-- Remplacez les UUID par ceux de vos produits

-- Pour le Boubou Elegant
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Rouge', 'M', 'Standard', 0, 8, 'CDE12486-RO-M-001'),
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Rouge', 'L', 'Standard', 0, 6, 'CDE12486-RO-L-002'),
('cde12486-1561-415e-9b4e-5fa3be2342a1', 'Bleu', 'M', 'Standard', 2000, 5, 'CDE12486-BL-M-003');

-- Pour l'iPhone 12 Pro
INSERT INTO produit_variantes (produit_id, couleur, taille, modele, prix_ajustement, stock, sku) VALUES
('8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf', 'Noir', NULL, '128GB', 0, 5, '8442CCBC-NO-128-001'),
('8442ccbc-6eee-4f5d-8cd2-6273ed2e1bdf', 'Blanc', NULL, '256GB', 25000, 3, '8442CCBC-BL-256-002');

-- Vérifier les résultats
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
ORDER BY p.name, pv.couleur;