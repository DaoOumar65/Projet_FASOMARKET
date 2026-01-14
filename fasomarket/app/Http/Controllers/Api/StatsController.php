<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function vendorStats()
    {
        $vendeur = auth()->user()->vendeur;
        
        if (!$vendeur) {
            return response()->json(['message' => 'Vendeur non trouvé'], 404);
        }

        $stats = [
            'total_produits' => Produit::whereHas('boutique', function($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->count(),
            
            'produits_actifs' => Produit::whereHas('boutique', function($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->where('actif', true)->count(),
            
            'total_commandes' => Commande::whereHas('produits.boutique', function($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->count(),
            
            'commandes_livrees' => Commande::whereHas('produits.boutique', function($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->where('statut', 'livree')->count(),
            
            'clients_uniques' => Commande::whereHas('produits.boutique', function($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->distinct('user_id')->count(),
            
            'chiffre_affaires' => Commande::whereHas('produits.boutique', function($q) use ($vendeur) {
                $q->where('vendeur_id', $vendeur->id);
            })->where('statut', 'livree')->sum('montant_total')
        ];

        return response()->json([
            'succes' => true,
            'stats' => $stats
        ]);
    }

    public function recentOrders()
    {
        $vendeur = auth()->user()->vendeur;
        
        $commandes = Commande::whereHas('produits.boutique', function($q) use ($vendeur) {
            $q->where('vendeur_id', $vendeur->id);
        })
        ->with(['user:id,nom,prenom,telephone', 'produits:id,nom,prix'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

        return response()->json([
            'succes' => true,
            'commandes' => $commandes
        ]);
    }

    public function topProducts()
    {
        $vendeur = auth()->user()->vendeur;
        
        $produits = Produit::whereHas('boutique', function($q) use ($vendeur) {
            $q->where('vendeur_id', $vendeur->id);
        })
        ->withCount('detailsCommandes')
        ->orderBy('details_commandes_count', 'desc')
        ->limit(5)
        ->get();

        return response()->json([
            'succes' => true,
            'produits' => $produits
        ]);
    }
}