<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            // Vérifier si l'utilisateur est un vendeur
            $isVendeur = ($user->type_utilisateur ?? '') === 'vendeur' || 
                         ($user->role ?? '') === 'vendeur' || 
                         ($user->type ?? '') === 'vendeur';

            if (!$isVendeur) {
                return response()->json([
                    'succes' => false,
                    'message' => 'Accès non autorisé - Utilisateur non vendeur'
                ], 403);
            }

            // Pour l'instant, retourner des données de test
            $deliveries = [
                [
                    'id' => 1,
                    'commande_id' => 1,
                    'numero_commande' => 'CMD-001',
                    'client_nom' => 'Jean Dupont',
                    'adresse_livraison' => '123 Rue de la Paix, Ouagadougou',
                    'statut' => 'en_cours',
                    'date_prevue' => '2026-01-09',
                    'montant' => 25000,
                    'created_at' => '2026-01-08T10:00:00Z'
                ],
                [
                    'id' => 2,
                    'commande_id' => 2,
                    'numero_commande' => 'CMD-002',
                    'client_nom' => 'Marie Martin',
                    'adresse_livraison' => '456 Avenue de l\'Indépendance, Bobo-Dioulasso',
                    'statut' => 'livree',
                    'date_prevue' => '2026-01-08',
                    'montant' => 15000,
                    'created_at' => '2026-01-07T14:30:00Z'
                ]
            ];

            return response()->json([
                'succes' => true,
                'livraisons' => [
                    'data' => $deliveries,
                    'total' => count($deliveries)
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur deliveries: ' . $e->getMessage());
            
            return response()->json([
                'succes' => false,
                'message' => 'Erreur serveur',
                'erreur' => config('app.debug') ? $e->getMessage() : 'Erreur interne'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            // Vérifier si l'utilisateur est un vendeur
            $isVendeur = ($user->type_utilisateur ?? '') === 'vendeur' || 
                         ($user->role ?? '') === 'vendeur' || 
                         ($user->type ?? '') === 'vendeur';

            if (!$isVendeur) {
                return response()->json([
                    'succes' => false,
                    'message' => 'Accès non autorisé - Utilisateur non vendeur'
                ], 403);
            }

            // Valider le statut
            $request->validate([
                'statut' => 'required|in:en_attente,en_cours,livree,annulee'
            ]);

            return response()->json([
                'succes' => true,
                'message' => 'Statut de livraison mis à jour',
                'livraison' => [
                    'id' => $id,
                    'statut' => $request->statut,
                    'updated_at' => now()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur update delivery: ' . $e->getMessage());
            
            return response()->json([
                'succes' => false,
                'message' => 'Erreur serveur',
                'erreur' => config('app.debug') ? $e->getMessage() : 'Erreur interne'
            ], 500);
        }
    }
}