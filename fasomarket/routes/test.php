<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route de test temporaire pour les commandes vendeur
Route::middleware('auth:sanctum')->get('/test-commandes-vendeur', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'succes' => true,
        'message' => 'Test réussi',
        'user' => [
            'id' => $user->id,
            'type' => $user->type_utilisateur,
            'nom' => $user->nom,
            'prenom' => $user->prenom
        ],
        'commandes' => [] // Retour vide pour le test
    ]);
});