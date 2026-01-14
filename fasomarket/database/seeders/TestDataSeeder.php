<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Vendeur;
use App\Models\Boutique;
use App\Models\Categorie;
use App\Models\Produit;

class TestDataSeeder extends Seeder
{
    public function run()
    {
        // Client test
        $client = User::create([
            'nom' => 'DAO',
            'prenom' => 'Test',
            'telephone' => '65209315',
            'type_utilisateur' => 'client'
        ]);

        // Vendeur test
        $vendeurUser = User::create([
            'nom' => 'Kaboré',
            'prenom' => 'Ibrahim',
            'telephone' => '+22670000001',
            'numero_ifu' => '123456789',
            'email' => 'ibrahim@test.com',
            'type_utilisateur' => 'vendeur'
        ]);

        $vendeur = Vendeur::create([
            'user_id' => $vendeurUser->id,
            'identifiant_vendeur' => 'VND123456'
        ]);

        // Boutique test
        $boutique = Boutique::create([
            'vendeur_id' => $vendeur->id,
            'nom_boutique' => 'Boutique Test',
            'description' => 'Une boutique de test',
            'adresse' => 'Ouagadougou',
            'ville' => 'Ouagadougou',
            'pays' => 'Burkina Faso'
        ]);

        // Catégorie test
        $categorie = Categorie::firstOrCreate([
            'nom' => 'Alimentation'
        ]);

        // Produit test
        Produit::create([
            'boutique_id' => $boutique->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Riz local',
            'description' => 'Riz de qualité',
            'prix' => 1500,
            'quantite_stock' => 50,
            'disponible' => true,
            'actif' => true
        ]);
    }
}