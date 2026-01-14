<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategorieController extends Controller
{
    public function index()
    {
        $categories = Categorie::withCount('produits')
            ->orderBy('nom')
            ->get();

        return response()->json([
            'succes' => true,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->type_utilisateur, ['admin', 'vendeur'])) {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les administrateurs et vendeurs peuvent créer des catégories'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icone' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $categorie = Categorie::create(array_merge($request->all(), [
            'actif' => true
        ]));

        return response()->json([
            'succes' => true,
            'message' => 'Catégorie créée avec succès',
            'categorie' => $categorie
        ], 201);
    }

    public function show(Categorie $categorie)
    {
        $categorie->load(['produits' => function($query) {
            $query->where('actif', true)
                  ->where('disponible', true)
                  ->with('boutique.vendeur.user');
        }]);

        return response()->json([
            'succes' => true,
            'categorie' => $categorie
        ]);
    }

    public function update(Request $request, Categorie $categorie)
    {
        $user = $request->user();
        if (!in_array($user->type_utilisateur, ['admin', 'vendeur'])) {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les administrateurs et vendeurs peuvent modifier les catégories'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255|unique:categories,nom,' . $categorie->id,
            'description' => 'nullable|string',
            'icone' => 'nullable|string|max:255',
            'actif' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $categorie->update($request->all());

        return response()->json([
            'succes' => true,
            'message' => 'Catégorie mise à jour avec succès',
            'categorie' => $categorie
        ]);
    }

    public function destroy(Categorie $categorie)
    {
        $user = request()->user();
        if ($user->type_utilisateur !== 'admin') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les administrateurs peuvent supprimer les catégories'
            ], 403);
        }

        // Vérifier s'il y a des produits dans cette catégorie
        if ($categorie->produits()->count() > 0) {
            return response()->json([
                'succes' => false,
                'message' => 'Impossible de supprimer une catégorie contenant des produits'
            ], 400);
        }

        $categorie->delete();

        return response()->json([
            'succes' => true,
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }
}