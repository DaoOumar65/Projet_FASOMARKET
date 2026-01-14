<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProduitController extends Controller
{
    public function index()
    {
        $produits = Produit::with(['boutique.vendeur.user', 'categorie'])
            ->where('actif', true)
            ->where('disponible', true)
            ->paginate(20);

        return response()->json([
            'succes' => true,
            'produits' => $produits
        ]);
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->type_utilisateur !== 'vendeur') {
                return response()->json([
                    'succes' => false,
                    'message' => 'Seuls les vendeurs peuvent créer des produits'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'boutique_id' => 'required|exists:boutiques,id',
                'nom' => 'required|string|max:255',
                'description' => 'required|string',
                'prix' => 'required|numeric|min:0',
                'stock_disponible' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'succes' => false,
                    'message' => 'Erreurs de validation',
                    'erreurs' => $validator->errors()
                ], 422);
            }

            $produit = Produit::create([
                'boutique_id' => $request->boutique_id,
                'categorie_id' => 1, // Catégorie par défaut
                'nom' => $request->nom,
                'description' => $request->description,
                'prix' => $request->prix,
                'stock_disponible' => $request->stock_disponible,
                'quantite_stock' => $request->stock_disponible,
                'disponible' => true,
                'actif' => true
            ]);

            return response()->json([
                'succes' => true,
                'message' => 'Produit créé avec succès',
                'produit' => $produit
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Produit $produit)
    {
        // Incrémenter les vues
        $produit->incrementerVues();
        
        return response()->json([
            'succes' => true,
            'produit' => $produit->load(['boutique.vendeur.user', 'categorie', 'images', 'variantes', 'attributs'])
        ]);
    }

    public function update(Request $request, Produit $produit)
    {
        $user = $request->user();
        if ($produit->boutique->vendeur->user_id !== $user->id) {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à modifier ce produit'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'categorie_id' => 'sometimes|required|exists:categories,id',
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'prix' => 'sometimes|required|numeric|min:0',
            'prix_promo' => 'nullable|numeric|min:0',
            'quantite_stock' => 'sometimes|required|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string|max:255',
            'disponible' => 'sometimes|boolean',
            'actif' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        // Validation du prix promo
        if ($request->has('prix_promo') && $request->prix_promo && $request->has('prix')) {
            if ($request->prix_promo >= $request->prix) {
                return response()->json([
                    'succes' => false,
                    'message' => 'Le prix promotionnel doit être inférieur au prix normal'
                ], 422);
            }
        }

        $produit->update($request->all());

        // Mettre à jour la disponibilité selon le stock
        if ($request->has('quantite_stock')) {
            $produit->update(['disponible' => $request->quantite_stock > 0]);
        }

        return response()->json([
            'succes' => true,
            'message' => 'Produit mis à jour avec succès',
            'produit' => $produit->load(['boutique', 'categorie'])
        ]);
    }

    public function destroy(Produit $produit)
    {
        $user = request()->user();
        if ($produit->boutique->vendeur->user_id !== $user->id) {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à supprimer ce produit'
            ], 403);
        }

        $produit->delete();

        return response()->json([
            'succes' => true,
            'message' => 'Produit supprimé avec succès'
        ]);
    }

    public function parBoutique($boutiqueId)
    {
        $produits = Produit::where('boutique_id', $boutiqueId)
            ->where('actif', true)
            ->where('disponible', true)
            ->with(['categorie'])
            ->paginate(20);

        return response()->json([
            'succes' => true,
            'produits' => $produits
        ]);
    }

    public function parCategorie($categorieId)
    {
        $produits = Produit::where('categorie_id', $categorieId)
            ->where('actif', true)
            ->where('disponible', true)
            ->with(['boutique.vendeur.user', 'categorie'])
            ->paginate(20);

        return response()->json([
            'succes' => true,
            'produits' => $produits
        ]);
    }

    public function rechercher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terme' => 'required|string|min:2',
            'prix_min' => 'nullable|numeric|min:0',
            'prix_max' => 'nullable|numeric|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
            'ville' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $query = Produit::with(['boutique.vendeur.user', 'categorie'])
            ->where('actif', true)
            ->where('disponible', true)
            ->where(function($q) use ($request) {
                $q->where('nom', 'LIKE', '%' . $request->terme . '%')
                  ->orWhere('description', 'LIKE', '%' . $request->terme . '%');
            });

        if ($request->has('prix_min')) {
            $query->where('prix', '>=', $request->prix_min);
        }

        if ($request->has('prix_max')) {
            $query->where('prix', '<=', $request->prix_max);
        }

        if ($request->has('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->has('ville')) {
            $query->whereHas('boutique', function($q) use ($request) {
                $q->where('ville', 'LIKE', '%' . $request->ville . '%');
            });
        }

        $produits = $query->paginate(20);

        return response()->json([
            'succes' => true,
            'produits' => $produits,
            'terme_recherche' => $request->terme
        ]);
    }

    public function produitsPublics()
    {
        $produits = Produit::with(['boutique.vendeur.user', 'categorie'])
            ->where('actif', true)
            ->where('disponible', true)
            ->paginate(20);

        return response()->json([
            'succes' => true,
            'produits' => $produits
        ]);
    }

    public function produitPublic($id)
    {
        $produit = Produit::with(['boutique.vendeur.user', 'categorie', 'images', 'variantes', 'attributs'])
            ->where('actif', true)
            ->where('disponible', true)
            ->findOrFail($id);

        // Incrémenter les vues
        $produit->incrementerVues();

        return response()->json([
            'succes' => true,
            'produit' => $produit
        ]);
    }

    public function vedettes()
    {
        $produits = Produit::with(['boutique.vendeur.user', 'categorie', 'images'])
            ->where('actif', true)
            ->where('disponible', true)
            ->where('vedette', true)
            ->paginate(20);

        return response()->json([
            'succes' => true,
            'produits' => $produits
        ]);
    }
}