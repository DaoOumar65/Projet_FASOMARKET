<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CodePromo;

class CodePromoSeeder extends Seeder
{
    public function run(): void
    {
        $codes = [
            [
                'code' => 'BIENVENUE20',
                'nom' => 'Code de bienvenue',
                'description' => '20% de réduction pour les nouveaux clients',
                'type' => 'pourcentage',
                'valeur' => 20,
                'montant_minimum' => 10000,
                'limite_utilisation' => 1000,
                'date_debut' => now(),
                'date_fin' => now()->addMonths(3),
                'actif' => true,
            ],
            [
                'code' => 'FASO2024',
                'nom' => 'Promotion Faso 2024',
                'description' => '5000 FCFA de réduction',
                'type' => 'montant_fixe',
                'valeur' => 5000,
                'montant_minimum' => 25000,
                'limite_utilisation' => 500,
                'date_debut' => now(),
                'date_fin' => now()->addMonths(6),
                'actif' => true,
            ],
        ];

        foreach ($codes as $code) {
            CodePromo::create($code);
        }
    }
}