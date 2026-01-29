-- Ajouter la colonne variant_config à la table categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS variant_config TEXT;

-- Exemples de configurations JSON pour les variantes

-- Configuration pour Mode/Vêtements
UPDATE categories SET variant_config = '{
  "variants": [
    {"couleur": "Noir", "taille": "S", "genre": "Unisexe", "prixAjustement": "0"},
    {"couleur": "Noir", "taille": "M", "genre": "Unisexe", "prixAjustement": "0"},
    {"couleur": "Noir", "taille": "L", "genre": "Unisexe", "prixAjustement": "0"},
    {"couleur": "Blanc", "taille": "S", "genre": "Unisexe", "prixAjustement": "0"},
    {"couleur": "Blanc", "taille": "M", "genre": "Unisexe", "prixAjustement": "0"},
    {"couleur": "Blanc", "taille": "L", "genre": "Unisexe", "prixAjustement": "0"},
    {"couleur": "Rouge", "taille": "S", "genre": "Unisexe", "prixAjustement": "1000"},
    {"couleur": "Rouge", "taille": "M", "genre": "Unisexe", "prixAjustement": "1000"},
    {"couleur": "Rouge", "taille": "L", "genre": "Unisexe", "prixAjustement": "1000"}
  ]
}' WHERE name = 'Mode';

-- Configuration pour Electronique
UPDATE categories SET variant_config = '{
  "variants": [
    {"couleur": "Noir", "capacite": "64GB", "prixAjustement": "0"},
    {"couleur": "Noir", "capacite": "128GB", "prixAjustement": "25000"},
    {"couleur": "Noir", "capacite": "256GB", "prixAjustement": "50000"},
    {"couleur": "Blanc", "capacite": "64GB", "prixAjustement": "0"},
    {"couleur": "Blanc", "capacite": "128GB", "prixAjustement": "25000"},
    {"couleur": "Blanc", "capacite": "256GB", "prixAjustement": "50000"}
  ]
}' WHERE name = 'Electronique';

-- Configuration pour Cosmétiques
UPDATE categories SET variant_config = '{
  "variants": [
    {"parfum": "Vanille", "finition": "Mat", "genre": "Femme", "prixAjustement": "0"},
    {"parfum": "Vanille", "finition": "Brillant", "genre": "Femme", "prixAjustement": "2000"},
    {"parfum": "Rose", "finition": "Mat", "genre": "Femme", "prixAjustement": "0"},
    {"parfum": "Rose", "finition": "Brillant", "genre": "Femme", "prixAjustement": "2000"},
    {"parfum": "Sans parfum", "finition": "Mat", "genre": "Unisexe", "prixAjustement": "-1000"}
  ]
}' WHERE name = 'Cosmétiques';

-- Configuration pour Alimentaire
UPDATE categories SET variant_config = '{
  "variants": [
    {"poids": "0.5", "modele": "Standard", "prixAjustement": "0"},
    {"poids": "1.0", "modele": "Standard", "prixAjustement": "1500"},
    {"poids": "2.0", "modele": "Standard", "prixAjustement": "2800"},
    {"poids": "0.5", "modele": "Bio", "prixAjustement": "2000"},
    {"poids": "1.0", "modele": "Bio", "prixAjustement": "3500"},
    {"poids": "2.0", "modele": "Bio", "prixAjustement": "4800"}
  ]
}' WHERE name = 'Alimentaire';

-- Configuration pour Maison
UPDATE categories SET variant_config = '{
  "variants": [
    {"couleur": "Blanc", "materiau": "Bois", "finition": "Mat", "prixAjustement": "10000"},
    {"couleur": "Blanc", "materiau": "Métal", "finition": "Mat", "prixAjustement": "5000"},
    {"couleur": "Noir", "materiau": "Bois", "finition": "Mat", "prixAjustement": "10000"},
    {"couleur": "Noir", "materiau": "Métal", "finition": "Mat", "prixAjustement": "5000"},
    {"couleur": "Beige", "materiau": "Bois", "finition": "Brillant", "prixAjustement": "12000"}
  ]
}' WHERE name = 'Maison';

-- Vérifier les configurations
SELECT name, variant_config FROM categories WHERE variant_config IS NOT NULL;