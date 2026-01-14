<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categorie;

class CategorieSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'nom' => 'Alimentation',
                'description' => 'Produits alimentaires, boissons, épices',
                'icone' => 'food-icon',
            ],
            [
                'nom' => 'Vêtements',
                'description' => 'Vêtements pour hommes, femmes et enfants',
                'icone' => 'clothing-icon',
            ],
            [
                'nom' => 'Électronique',
                'description' => 'Téléphones, ordinateurs, accessoires électroniques',
                'icone' => 'electronics-icon',
            ],
            [
                'nom' => 'Maison & Jardin',
                'description' => 'Meubles, décoration, outils de jardinage',
                'icone' => 'home-icon',
            ],
            [
                'nom' => 'Beauté & Santé',
                'description' => 'Cosmétiques, produits de soins, médicaments',
                'icone' => 'beauty-icon',
            ],
            [
                'nom' => 'Sport & Loisirs',
                'description' => 'Équipements sportifs, jeux, loisirs',
                'icone' => 'sports-icon',
            ],
            [
                'nom' => 'Artisanat Local',
                'description' => 'Produits artisanaux du Burkina Faso',
                'icone' => 'craft-icon',
            ],
            [
                'nom' => 'Automobile',
                'description' => 'Pièces auto, accessoires, entretien',
                'icone' => 'auto-icon',
            ],
            [
                'nom' => 'Livres & Éducation',
                'description' => 'Livres, fournitures scolaires, matériel éducatif',
                'icone' => 'books-icon',
            ],
            [
                'nom' => 'Services',
                'description' => 'Services divers, réparations, consultations',
                'icone' => 'services-icon',
            ],
        ];

        foreach ($categories as $categorie) {
            Categorie::create($categorie);
        }
    }
}