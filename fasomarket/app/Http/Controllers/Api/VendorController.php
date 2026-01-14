<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\User;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les vendeurs peuvent accéder à cette ressource'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => true,
                'stats' => [
                    'livraisons' => 0,
                    'commandes' => 0,
                    'produits' => 0,
                    'clients' => 0
                ]
            ]);
        }

        $stats = [
            'livraisons' => Commande::whereHas('detailsCommandes.produit.boutique', function ($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->where('statut', 'livree')->count(),

            'commandes' => Commande::whereHas('detailsCommandes.produit.boutique', function ($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->count(),

            'produits' => Produit::whereHas('boutique', function ($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->count(),

            'clients' => User::whereHas('commandes.detailsCommandes.produit.boutique', function ($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->distinct()->count()
        ];

        return response()->json([
            'succes' => true,
            'stats' => $stats
        ]);
    }

    public function orders(Request $request)
    {
        $user = auth()->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les vendeurs peuvent accéder à cette ressource'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => true,
                'commandes' => []
            ]);
        }

        $query = Commande::whereHas('detailsCommandes.produit.boutique', function ($q) use ($vendeur) {
            $q->where('vendeur_id', $vendeur->id);
        })->with('user:id,nom,prenom,telephone');

        if ($request->has('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        $commandes = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'succes' => true,
            'commandes' => $commandes
        ]);
    }

    public function updateOrderStatus(Request $request, Commande $commande)
    {
        $user = auth()->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les vendeurs peuvent accéder à cette ressource'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => false,
                'message' => 'Profil vendeur non trouvé'
            ], 404);
        }

        // Vérifier que le vendeur a des produits dans cette commande
        $hasProducts = $commande->detailsCommandes()
            ->whereHas('produit.boutique', function ($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->exists();

        if (!$hasProducts) {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à modifier cette commande'
            ], 403);
        }

        $validated = $request->validate([
            'statut' => 'required|in:en_attente,confirmee,en_preparation,expediee,livree,annulee'
        ]);

        $commande->update($validated);

        return response()->json([
            'succes' => true,
            'commande' => $commande
        ]);
    }

    public function clients()
    {
        $user = auth()->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les vendeurs peuvent accéder à cette ressource'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => true,
                'clients' => []
            ]);
        }

        $clients = User::whereHas('commandes.detailsCommandes.produit.boutique', function ($q) use ($vendeur) {
            $q->where('vendeur_id', $vendeur->id);
        })->select('id', 'nom', 'prenom', 'telephone')->distinct()->get();

        return response()->json([
            'succes' => true,
            'clients' => $clients
        ]);
    }
}
