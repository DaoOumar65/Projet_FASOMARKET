-- Ajouter la colonne variant_config à la table categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS variant_config TEXT;

-- Vérifier que la colonne a été créée
\d categories;