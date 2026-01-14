<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panier;
use App\Models\PanierItem;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PanierController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $panier = $user->panier()->with(['items.produit.boutique'])->first();

        if (!$panier) {
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => [],
                    'nombre_articles' => 0,
                    'sous_total' => 0,
                    'total' => 0
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $panier->id,
                'items' => $panier->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'produit' => [
                            'id' => $item->produit->id,
                            'nom' => $item->produit->nom,
                            'prix' => $item->produit->prix,
                            'image' => $item->produit->images[0] ?? null,
                            'boutique' => [
                                'id' => $item->produit->boutique->id,
                                'nom' => $item->produit->boutique->nom_boutique
                            ]
                        ],
                        'quantite' => $item->quantite,
                        'prix_unitaire' => $item->prix_unitaire,
                        'sous_total' => $item->sous_total,
                        'message_vendeur' => $item->message_vendeur
                    ];
                }),
                'nombre_articles' => $panier->items->sum('quantite'),
                'sous_total' => $panier->sous_total,
                'reduction_promo' => $panier->reduction_promo,
                'total' => $panier->total
            ]
        ]);
    }

    public function ajouter(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'message_vendeur' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $produit = Produit::findOrFail($request->produit_id);

        if ($produit->quantite_stock < $request->quantite) {
            return response()->json([
                'success' => false,
                'message' => 'Stock insuffisant'
            ], 400);
        }

        $panier = $user->panier()->firstOrCreate(['user_id' => $user->id]);

        $itemExistant = $panier->items()->where('produit_id', $produit->id)->first();

        if ($itemExistant) {
            $itemExistant->quantite += $request->quantite;
            $itemExistant->save();
        } else {
            $panier->items()->create([
                'produit_id' => $produit->id,
                'quantite' => $request->quantite,
                'prix_unitaire' => $produit->prix_promo ?? $produit->prix,
                'message_vendeur' => $request->message_vendeur
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produit ajouté au panier'
        ]);
    }

    public function modifierQuantite(Request $request, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'quantite' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $item = PanierItem::whereHas('panier', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($itemId);

        if ($item->produit->quantite_stock < $request->quantite) {
            return response()->json([
                'success' => false,
                'message' => 'Stock insuffisant'
            ], 400);
        }

        $item->quantite = $request->quantite;
        $item->save();

        return response()->json([
            'success' => true,
            'message' => 'Quantité mise à jour'
        ]);
    }

    public function supprimerItem($itemId)
    {
        $user = request()->user();
        $item = PanierItem::whereHas('panier', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($itemId);

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article supprimé du panier'
        ]);
    }

    public function vider(Request $request)
    {
        $user = $request->user();
        $panier = $user->panier()->first();

        if ($panier) {
            $panier->items()->delete();
            $panier->calculerTotaux();
        }

        return response()->json([
            'success' => true,
            'message' => 'Panier vidé'
        ]);
    }
}