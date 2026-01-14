<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ImageController extends Controller
{
    public function store(Request $request, $type, $id)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('image');
        $path = $file->store('images/' . $type, 'public');
        $url = Storage::url($path);

        // Créer thumbnail
        $thumbnailPath = 'thumbnails/' . $type . '/' . $file->hashName();
        // TODO: Implémenter la génération de thumbnail

        $modelClass = $type === 'produits' ? 'App\\Models\\Produit' : 'App\\Models\\Boutique';
        $model = $modelClass::findOrFail($id);

        $image = $model->images()->create([
            'path' => $path,
            'url' => $url,
            'thumbnail_url' => $url, // Temporaire
            'alt_text' => $request->alt_text,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'is_primary' => $request->boolean('is_primary', false),
            'order' => $model->images()->count()
        ]);

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Image uploadée avec succès',
            'image' => $image
        ], 201);
    }

    public function destroy(Image $image)
    {
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Image supprimée avec succès'
        ]);
    }

    public function updateOrder(Request $request, Image $image)
    {
        $validator = Validator::make($request->all(), [
            'order' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $image->update(['order' => $request->order]);

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Ordre mis à jour'
        ]);
    }
}