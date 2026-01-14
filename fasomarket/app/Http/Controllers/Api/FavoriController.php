<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favori;
use App\Models\Produit;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $favoris = $user->favoris()->with(['produit.boutique'])->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $favoris->map(function ($favori) {
                return [
                    'id' => $favori->id,
                    'produit' => [
                        'id' => $favori->produit->id,
                        'nom' => $favori->produit->nom,
                        'prix' => $favori->produit->prix,
                        'prix_promo' => $favori->produit->prix_promo,
                        'image' => $favori->produit->images[0] ?? null,
                        'boutique' => [
                            'id' => $favori->produit->boutique->id,
                            'nom' => $favori->produit->boutique->nom_boutique
                        ]
                    ],
                    'date_ajout' => $favori->created_at
                ];
            }),
            'meta' => [
                'current_page' => $favoris->currentPage(),
                'total' => $favoris->total()
            ]
        ]);
    }

    public function ajouter(Request $request)
    {
        $user = $request->user();
        $produitId = $request->produit_id;

        $produit = Produit::findOrFail($produitId);

        $favoriExistant = $user->favoris()->where('produit_id', $produitId)->first();

        if ($favoriExistant) {
            return response()->json([
                'success' => false,
                'message' => 'Produit déjà dans les favoris'
            ], 400);
        }

        $user->favoris()->create(['produit_id' => $produitId]);

        return response()->json([
            'success' => true,
            'message' => 'Produit ajouté aux favoris'
        ]);
    }

    public function supprimer(Request $request, $produitId)
    {
        $user = $request->user();
        $favori = $user->favoris()->where('produit_id', $produitId)->first();

        if (!$favori) {
            return response()->json([
                'success' => false,
                'message' => 'Produit non trouvé dans les favoris'
            ], 404);
        }

        $favori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit retiré des favoris'
        ]);
    }
}