-- Vérification complète des variantes étendues
SELECT 
    pv.id,
    pv.couleur,
    pv.taille,
    pv.modele,
    pv.genre,
    pv.saison,
    pv.capacite,
    pv.parfum,
    pv.finition,
    pv.materiau,
    pv.poids,
    pv.dimensions,
    pv.puissance,
    pv.age_cible,
    pv.prix_ajustement,
    pv.stock,
    pv.sku,
    p.name as nom_produit,
    p.category as categorie
FROM produit_variantes pv
JOIN products p ON pv.produit_id = p.id
ORDER BY p.category, p.name;