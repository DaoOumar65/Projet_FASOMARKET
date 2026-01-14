<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VendeurController extends Controller
{
    public function index()
    {
        $vendeurs = Vendeur::with(['user', 'boutiques'])
            ->where('statut', 'approuve')
            ->paginate(15);

        return response()->json([
            'succes' => true,
            'vendeurs' => $vendeurs
        ]);
    }

    public function store(Request $request)
    {
        return response()->json([
            'succes' => false,
            'message' => 'Utilisez l\'endpoint /inscription-vendeur pour créer un compte vendeur'
        ], 405);
    }

    public function show(Vendeur $vendeur)
    {
        return response()->json([
            'succes' => true,
            'vendeur' => $vendeur->load(['user', 'boutiques.produits'])
        ]);
    }

    public function update(Request $request, Vendeur $vendeur)
    {
        $user = $request->user();

        if ($vendeur->user_id !== $user->id && $user->type_utilisateur !== 'admin') {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à modifier ce profil vendeur'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_entreprise' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'numero_registre_commerce' => 'nullable|string|max:255',
            'statut' => 'sometimes|in:en_attente,approuve,suspendu', // Seuls les admins peuvent changer le statut
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        // Seuls les admins peuvent changer le statut
        if ($request->has('statut') && $user->type_utilisateur !== 'admin') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les administrateurs peuvent modifier le statut'
            ], 403);
        }

        $vendeur->update($request->all());

        return response()->json([
            'succes' => true,
            'message' => 'Profil vendeur mis à jour avec succès',
            'vendeur' => $vendeur->load('user')
        ]);
    }

    public function destroy(Vendeur $vendeur)
    {
        $user = request()->user();

        if ($vendeur->user_id !== $user->id && $user->type_utilisateur !== 'admin') {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à supprimer ce profil vendeur'
            ], 403);
        }

        // Vérifier s'il y a des commandes en cours
        $commandesEnCours = $vendeur->boutiques()
            ->whereHas('produits.detailsCommandes.commande', function ($q) {
                $q->whereIn('statut', ['en_attente', 'confirmee', 'en_preparation', 'expediee']);
            })->exists();

        if ($commandesEnCours) {
            return response()->json([
                'succes' => false,
                'message' => 'Impossible de supprimer le profil vendeur. Des commandes sont en cours.'
            ], 400);
        }

        $vendeur->delete();

        return response()->json([
            'succes' => true,
            'message' => 'Profil vendeur supprimé avec succès'
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Accès réservé aux vendeurs'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => true,
                'dashboard' => [
                    'total_boutiques' => 0,
                    'total_produits' => 0,
                    'total_commandes' => 0,
                    'chiffre_affaires' => 0,
                    'statut_vendeur' => null
                ]
            ]);
        }

        // Statistiques basiques pour le dashboard
        $boutiques = $vendeur->boutiques;
        $totalProduits = $vendeur->boutiques()->withCount('produits')->get()->sum('produits_count');
        $totalCommandes = DB::table('commandes')
            ->join('details_commandes', 'commandes.id', '=', 'details_commandes.commande_id')
            ->join('produits', 'details_commandes.produit_id', '=', 'produits.id')
            ->join('boutiques', 'produits.boutique_id', '=', 'boutiques.id')
            ->where('boutiques.vendeur_id', $vendeur->id)
            ->where('commandes.statut', '!=', 'annulee')
            ->distinct('commandes.id')
            ->count('commandes.id');

        $chiffreAffaires = DB::table('details_commandes')
            ->join('commandes', 'details_commandes.commande_id', '=', 'commandes.id')
            ->join('produits', 'details_commandes.produit_id', '=', 'produits.id')
            ->join('boutiques', 'produits.boutique_id', '=', 'boutiques.id')
            ->where('boutiques.vendeur_id', $vendeur->id)
            ->where('commandes.statut', '!=', 'annulee')
            ->sum('details_commandes.sous_total');

        return response()->json([
            'succes' => true,
            'dashboard' => [
                'total_boutiques' => $boutiques->count(),
                'total_produits' => $totalProduits,
                'total_commandes' => $totalCommandes,
                'chiffre_affaires' => $chiffreAffaires,
                'statut_vendeur' => $vendeur->statut
            ]
        ]);
    }

    public function clients(Request $request)
    {
        $user = $request->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Accès réservé aux vendeurs'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => true,
                'clients' => []
            ]);
        }

        // Récupérer les clients qui ont commandé chez ce vendeur
        $clients = DB::table('users')
            ->join('commandes', 'users.id', '=', 'commandes.user_id')
            ->join('details_commandes', 'commandes.id', '=', 'details_commandes.commande_id')
            ->join('produits', 'details_commandes.produit_id', '=', 'produits.id')
            ->join('boutiques', 'produits.boutique_id', '=', 'boutiques.id')
            ->where('boutiques.vendeur_id', $vendeur->id)
            ->select('users.id', 'users.nom', 'users.prenom', 'users.telephone')
            ->distinct()
            ->get();

        return response()->json([
            'succes' => true,
            'clients' => $clients
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();

        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Accès réservé aux vendeurs'
            ], 403);
        }

        $vendeur = $user->vendeur;
        if (!$vendeur) {
            return response()->json([
                'succes' => true,
                'notifications' => []
            ]);
        }

        // Notifications basiques (nouvelles commandes, etc.)
        $notifications = [];

        // Nouvelles commandes
        $nouvellesCommandes = DB::table('commandes')
            ->join('details_commandes', 'commandes.id', '=', 'details_commandes.commande_id')
            ->join('produits', 'details_commandes.produit_id', '=', 'produits.id')
            ->join('boutiques', 'produits.boutique_id', '=', 'boutiques.id')
            ->where('boutiques.vendeur_id', $vendeur->id)
            ->where('commandes.statut', 'en_attente')
            ->count();

        if ($nouvellesCommandes > 0) {
            $notifications[] = [
                'type' => 'nouvelle_commande',
                'message' => "Vous avez {$nouvellesCommandes} nouvelle(s) commande(s) en attente",
                'count' => $nouvellesCommandes,
                'created_at' => now()
            ];
        }

        return response()->json([
            'succes' => true,
            'notifications' => $notifications
        ]);
    }
}
