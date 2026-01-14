<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductVariantController extends Controller
{
    public function index(Produit $produit)
    {
        $variantes = $produit->variantes()->where('actif', true)->get();

        return response()->json([
            'success' => true,
            'succes' => true,
            'variantes' => $variantes
        ]);
    }

    public function store(Request $request, Produit $produit)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'sku' => 'required|string|unique:product_variants',
            'prix' => 'nullable|numeric|min:0',
            'quantite_stock' => 'required|integer|min:0',
            'options' => 'required|array',
            'image_url' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $variante = $produit->variantes()->create($request->all());

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Variante créée avec succès',
            'variante' => $variante
        ], 201);
    }

    public function update(Request $request, ProductVariant $variante)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'sku' => 'sometimes|required|string|unique:product_variants,sku,' . $variante->id,
            'prix' => 'nullable|numeric|min:0',
            'quantite_stock' => 'sometimes|required|integer|min:0',
            'options' => 'sometimes|required|array',
            'image_url' => 'nullable|url',
            'actif' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $variante->update($request->all());

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Variante mise à jour',
            'variante' => $variante
        ]);
    }

    public function destroy(ProductVariant $variante)
    {
        $variante->delete();

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Variante supprimée'
        ]);
    }
}