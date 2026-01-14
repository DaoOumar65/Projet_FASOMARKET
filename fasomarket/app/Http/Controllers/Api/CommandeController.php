<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\DetailCommande;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CommandeController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $userId = (int) $user->id;
        $commandes = Commande::where('user_id', $userId)
            ->with(['detailsCommandes.produit.boutique'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'succes' => true,
            'commandes' => $commandes
        ]);
    }

    public function store(Request $request)
    {
        return $this->passerCommande($request);
    }

    public function show(Commande $commande)
    {
        $user = request()->user();

        // Vérifier que l'utilisateur peut voir cette commande
        if ($commande->user_id !== $user->id && $user->type_utilisateur !== 'admin') {
            // Si c'est un vendeur, vérifier qu'il a des produits dans cette commande
            if ($user->type_utilisateur === 'vendeur') {
                $userId = (int) $user->id;
                $hasProducts = $commande->detailsCommandes()
                    ->whereHas('produit.boutique.vendeur', function ($q) use ($userId) {
                        $q->where('user_id', $userId);
                    })->exists();

                if (!$hasProducts) {
                    return response()->json([
                        'succes' => false,
                        'message' => 'Non autorisé à voir cette commande'
                    ], 403);
                }
            } else {
                return response()->json([
                    'succes' => false,
                    'message' => 'Non autorisé à voir cette commande'
                ], 403);
            }
        }

        return response()->json([
            'succes' => true,
            'commande' => $commande->load(['detailsCommandes.produit.boutique.vendeur.user', 'user'])
        ]);
    }

    public function passerCommande(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'produits' => 'required|array|min:1',
            'produits.*.produit_id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
            'adresse_livraison' => 'required|string|max:255',
            'ville_livraison' => 'required|string|max:100',
            'telephone_livraison' => 'required|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        DB::beginTransaction();
        try {
            $montantTotal = 0;
            $detailsCommande = [];

            // Vérifier la disponibilité et calculer le montant
            foreach ($request->produits as $item) {
                $produit = Produit::findOrFail($item['produit_id']);

                if (!$produit->actif || !$produit->disponible) {
                    throw new \Exception("Le produit '{$produit->nom}' n'est plus disponible");
                }

                if ($produit->quantite_stock < $item['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit '{$produit->nom}'. Stock disponible: {$produit->quantite_stock}");
                }

                $prixUnitaire = $produit->prix_promo ?? $produit->prix;
                $sousTotal = $prixUnitaire * $item['quantite'];
                $montantTotal += $sousTotal;

                $detailsCommande[] = [
                    'produit' => $produit,
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $prixUnitaire,
                    'sous_total' => $sousTotal,
                ];
            }

            // Créer la commande
            $commande = Commande::create([
                'numero_commande' => Commande::genererNumeroCommande(),
                'user_id' => $user->id,
                'montant_total' => $montantTotal,
                'adresse_livraison' => $request->adresse_livraison,
                'ville_livraison' => $request->ville_livraison,
                'telephone_livraison' => $request->telephone_livraison,
                'notes' => $request->notes,
            ]);

            // Créer les détails de commande et mettre à jour le stock
            foreach ($detailsCommande as $detail) {
                DetailCommande::create([
                    'commande_id' => $commande->id,
                    'produit_id' => $detail['produit']->id,
                    'quantite' => $detail['quantite'],
                    'prix_unitaire' => $detail['prix_unitaire'],
                    'sous_total' => $detail['sous_total'],
                ]);

                // Mettre à jour le stock
                $nouveauStock = $detail['produit']->quantite_stock - $detail['quantite'];
                $detail['produit']->update([
                    'quantite_stock' => $nouveauStock,
                    'disponible' => $nouveauStock > 0,
                ]);
            }

            DB::commit();

            return response()->json([
                'succes' => true,
                'message' => 'Commande passée avec succès',
                'commande' => $commande->load(['detailsCommandes.produit.boutique'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'succes' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function changerStatut(Request $request, Commande $commande)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:en_attente,confirmee,en_preparation,expediee,livree,annulee',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Vérifier les permissions
        if ($user->type_utilisateur === 'client' && $user->id === $commande->user_id) {
            // Les clients ne peuvent que annuler leurs commandes en attente
            if ($request->statut !== 'annulee' || $commande->statut !== 'en_attente') {
                return response()->json([
                    'succes' => false,
                    'message' => 'Vous ne pouvez que annuler vos commandes en attente'
                ], 403);
            }
        } elseif ($user->type_utilisateur === 'vendeur') {
            // Vérifier que le vendeur a des produits dans cette commande
            $userId = (int) $user->id;
            $hasProducts = $commande->detailsCommandes()
                ->whereHas('produit.boutique.vendeur', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->exists();

            if (!$hasProducts) {
                return response()->json([
                    'succes' => false,
                    'message' => 'Non autorisé à modifier cette commande'
                ], 403);
            }
        } elseif ($user->type_utilisateur !== 'admin') {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        // Si annulation, remettre les produits en stock
        if ($request->statut === 'annulee' && $commande->statut !== 'annulee') {
            foreach ($commande->detailsCommandes as $detail) {
                $produit = $detail->produit;
                $produit->update([
                    'quantite_stock' => $produit->quantite_stock + $detail->quantite,
                    'disponible' => true,
                ]);
            }
        }

        $commande->update(['statut' => $request->statut]);

        return response()->json([
            'succes' => true,
            'message' => 'Statut de la commande mis à jour',
            'commande' => $commande
        ]);
    }

    public function mesCommandes(Request $request)
    {
        $user = $request->user();
        $userId = (int) $user->id;
        $commandes = Commande::where('user_id', $userId)
            ->with(['detailsCommandes.produit.boutique'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'succes' => true,
            'commandes' => $commandes
        ]);
    }

    public function commandesVendeur(Request $request)
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

            $userId = (int) $user->id;
            
            // Approche simple : récupérer toutes les commandes et filtrer côté PHP
            $commandes = Commande::with([
                'detailsCommandes.produit.boutique',
                'user'
            ])
            ->get()
            ->filter(function ($commande) use ($userId) {
                return $commande->detailsCommandes->some(function ($detail) use ($userId) {
                    return $detail->produit && 
                           $detail->produit->boutique && 
                           ($detail->produit->boutique->vendeur_id == $userId || 
                            $detail->produit->boutique->user_id == $userId);
                });
            })
            ->sortByDesc('created_at')
            ->take(15)
            ->values();

            return response()->json([
                'succes' => true,
                'commandes' => [
                    'data' => $commandes,
                    'total' => $commandes->count()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur commandesVendeur: ' . $e->getMessage());
            
            return response()->json([
                'succes' => false,
                'message' => 'Erreur serveur',
                'erreur' => config('app.debug') ? $e->getMessage() : 'Erreur interne'
            ], 500);
        }
    }
}