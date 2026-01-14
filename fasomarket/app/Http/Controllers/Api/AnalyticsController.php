<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function vendor(Request $request)
    {
        $user = $request->user();
        
        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $period = $request->get('period', 30);
        $userId = $user->id;

        try {
            // Revenus total
            $totalRevenue = Commande::whereHas('detailsCommandes.produit.boutique', function($q) use ($userId) {
                $q->where('vendeur_id', $userId);
            })->sum('montant_total');

            // Nombre de commandes
            $totalOrders = Commande::whereHas('detailsCommandes.produit.boutique', function($q) use ($userId) {
                $q->where('vendeur_id', $userId);
            })->count();

            // Nombre de produits
            $totalProducts = Produit::whereHas('boutique', function($q) use ($userId) {
                $q->where('vendeur_id', $userId);
            })->count();

            // Nombre de boutiques
            $totalShops = Boutique::where('vendeur_id', $userId)->count();

            // Commandes récentes
            $recentOrders = Commande::whereHas('detailsCommandes.produit.boutique', function($q) use ($userId) {
                $q->where('vendeur_id', $userId);
            })
            ->with(['user', 'detailsCommandes.produit'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

            // Produits les plus vendus
            $topProducts = Produit::whereHas('boutique', function($q) use ($userId) {
                $q->where('vendeur_id', $userId);
            })
            ->withCount('detailsCommandes')
            ->orderBy('details_commandes_count', 'desc')
            ->take(5)
            ->get();

            // Revenus mensuels (derniers 6 mois)
            $monthlyRevenue = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $revenue = Commande::whereHas('detailsCommandes.produit.boutique', function($q) use ($userId) {
                    $q->where('vendeur_id', $userId);
                })
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('montant_total');
                
                $monthlyRevenue[] = [
                    'month' => $date->format('M Y'),
                    'revenue' => $revenue
                ];
            }

            return response()->json([
                'succes' => true,
                'analytics' => [
                    'totalRevenue' => $totalRevenue,
                    'totalOrders' => $totalOrders,
                    'totalProducts' => $totalProducts,
                    'totalShops' => $totalShops,
                    'recentOrders' => $recentOrders,
                    'topProducts' => $topProducts,
                    'monthlyRevenue' => $monthlyRevenue
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreur lors de la récupération des analytics'
            ], 500);
        }
    }
}