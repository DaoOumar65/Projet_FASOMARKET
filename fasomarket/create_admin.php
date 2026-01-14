<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Hash;
use App\Models\User;

// Initialiser Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Créer un utilisateur admin
$admin = User::create([
    'nom' => 'Admin',
    'prenom' => 'FasoMarket',
    'email' => 'admin@fasomarket.com',
    'telephone' => '+22670000000',
    'type_utilisateur' => 'admin',
    'password' => Hash::make('admin123'),
    'actif' => true,
]);

echo "Utilisateur admin créé avec succès!\n";
echo "Email: admin@fasomarket.com\n";
echo "Mot de passe: admin123\n";
echo "Token: " . $admin->createToken('admin-token')->plainTextToken . "\n";