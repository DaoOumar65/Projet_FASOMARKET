<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\Boutique;
use App\Models\User;
use App\Models\Commande;
use App\Models\Categorie;
use Illuminate\Http\Request;

class AccueilController extends Controller
{
    public function statistiques()
    {
        $stats = [
            'produits' => Produit::where('actif', true)->count(),
            'boutiques' => Boutique::where('actif', true)->count(),
            'clients' => User::where('type_utilisateur', 'client')->count(),
            'vendeurs' => User::where('type_utilisateur', 'vendeur')->count(),
            'commandes' => Commande::count(),
        ];

        return response()->json([
            'success' => true,
            'succes' => true,
            'statistiques' => $stats
        ]);
    }

    public function produitsVedettes()
    {
        $produits = Produit::with(['boutique', 'categorie', 'images'])
            ->where('actif', true)
            ->where('disponible', true)
            ->where('vedette', true)
            ->orderBy('vues', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'succes' => true,
            'produits' => $produits
        ]);
    }

    public function boutiquesPopulaires()
    {
        $boutiques = Boutique::with(['vendeur.user', 'images'])
            ->where('actif', true)
            ->withCount('produits')
            ->orderBy('note_moyenne', 'desc')
            ->orderBy('produits_count', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'succes' => true,
            'boutiques' => $boutiques
        ]);
    }

    public function categoriesPopulaires()
    {
        $categories = Categorie::withCount(['produits' => function($query) {
            $query->where('actif', true)->where('disponible', true);
        }])
        ->having('produits_count', '>', 0)
        ->orderBy('produits_count', 'desc')
        ->limit(8)
        ->get();

        return response()->json([
            'success' => true,
            'succes' => true,
            'categories' => $categories
        ]);
    }

    public function nouveauxProduits()
    {
        $produits = Produit::with(['boutique', 'categorie', 'images'])
            ->where('actif', true)
            ->where('disponible', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'succes' => true,
            'produits' => $produits
        ]);
    }

    public function donneesAccueil()
    {
        try {
            // Statistiques générales
            $stats = [
                'produits' => Produit::where('actif', true)->count(),
                'boutiques' => Boutique::where('actif', true)->count(),
                'clients' => User::where('type_utilisateur', 'client')->count(),
                'vendeurs' => User::where('type_utilisateur', 'vendeur')->count(),
            ];

            // Produits vedettes (ou les plus vus si pas de champ vedette)
            $produitsVedettes = Produit::with(['boutique', 'categorie', 'images'])
                ->where('actif', true)
                ->where('disponible', true)
                ->orderBy('vues', 'desc')
                ->limit(8)
                ->get();

            // Nouveaux produits
            $nouveauxProduits = Produit::with(['boutique', 'categorie', 'images'])
                ->where('actif', true)
                ->where('disponible', true)
                ->where('created_at', '>=', now()->subDays(7))
                ->orderBy('created_at', 'desc')
                ->limit(8)
                ->get();

            // Boutiques populaires
            $boutiquesPopulaires = Boutique::with(['vendeur.user', 'images'])
                ->where('actif', true)
                ->withCount('produits')
                ->orderBy('note_moyenne', 'desc')
                ->limit(6)
                ->get();

            // Catégories avec produits
            $categories = Categorie::withCount(['produits' => function($query) {
                $query->where('actif', true)->where('disponible', true);
            }])
            ->having('produits_count', '>', 0)
            ->orderBy('produits_count', 'desc')
            ->limit(8)
            ->get();

            return response()->json([
                'success' => true,
                'succes' => true,
                'data' => [
                    'statistiques' => $stats,
                    'produits_vedettes' => $produitsVedettes,
                    'nouveaux_produits' => $nouveauxProduits,
                    'boutiques_populaires' => $boutiquesPopulaires,
                    'categories' => $categories
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreur lors de la récupération des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}