<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BoutiqueController extends Controller
{
    public function index()
    {
        $boutiques = Boutique::with(['vendeur.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'succes' => true,
            'boutiques' => $boutiques
        ]);
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->type_utilisateur !== 'vendeur') {
                return response()->json([
                    'succes' => false,
                    'message' => 'Seuls les vendeurs peuvent créer des boutiques'
                ], 403);
            }

            // Vérifier ou créer le profil vendeur
            $vendeur = $user->vendeur;
            if (!$vendeur) {
                $vendeur = \App\Models\Vendeur::create([
                    'user_id' => $user->id,
                    'identifiant_vendeur' => 'V' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                    'nom_entreprise' => $request->nom_boutique ?? 'Entreprise ' . $user->nom
                ]);
            }

            $validator = Validator::make($request->all(), [
                'nom_boutique' => 'required|string|max:255',
                'adresse' => 'required|string',
                'ville' => 'required|string|max:100',
                'telephone' => 'required|string|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'succes' => false,
                    'message' => 'Erreurs de validation',
                    'erreurs' => $validator->errors()
                ], 422);
            }

            $boutique = Boutique::create([
                'vendeur_id' => $vendeur->id,
                'nom_boutique' => $request->nom_boutique,
                'slug' => Str::slug($request->nom_boutique . '-' . time()),
                'adresse' => $request->adresse,
                'ville' => $request->ville,
                'pays' => 'Burkina Faso',
                'telephone' => $request->telephone
            ]);

            return response()->json([
                'succes' => true,
                'message' => 'Boutique créée avec succès',
                'boutique' => $boutique
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Boutique $boutique)
    {
        return response()->json([
            'succes' => true,
            'boutique' => $boutique->load(['vendeur.user', 'produits'])
        ]);
    }

    public function update(Request $request, Boutique $boutique)
    {
        $user = $request->user();
        if ($boutique->vendeur->user_id !== $user->id) {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à modifier cette boutique'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_boutique' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'adresse' => 'sometimes|required|string|max:255',
            'ville' => 'sometimes|required|string|max:100',
            'pays' => 'nullable|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|string|max:255',
            'actif' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $boutique->update($request->all());

        return response()->json([
            'succes' => true,
            'message' => 'Boutique mise à jour avec succès',
            'boutique' => $boutique->load('vendeur.user')
        ]);
    }

    public function destroy(Boutique $boutique)
    {
        $user = request()->user();
        if ($boutique->vendeur->user_id !== $user->id) {
            return response()->json([
                'succes' => false,
                'message' => 'Non autorisé à supprimer cette boutique'
            ], 403);
        }

        $boutique->delete();

        return response()->json([
            'succes' => true,
            'message' => 'Boutique supprimée avec succès'
        ]);
    }

    public function parLocalisation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:100',
            'adresse' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $query = Boutique::where('actif', true)->with(['vendeur.user']);

        if ($request->ville) {
            $query->where('ville', 'LIKE', "%{$request->ville}%");
        }

        if ($request->pays) {
            $query->where('pays', 'LIKE', "%{$request->pays}%");
        }

        if ($request->adresse) {
            $query->where('adresse', 'LIKE', "%{$request->adresse}%");
        }

        $boutiques = $query->paginate(15);

        return response()->json([
            'succes' => true,
            'boutiques' => $boutiques,
            'criteres_recherche' => $request->only(['ville', 'pays', 'adresse'])
        ]);
    }

    public function parVendeur($vendeurId)
    {
        $boutiques = Boutique::where('vendeur_id', $vendeurId)
            ->where('actif', true)
            ->with(['vendeur.user'])
            ->paginate(15);

        return response()->json([
            'succes' => true,
            'boutiques' => $boutiques
        ]);
    }

    public function boutiquesPubliques()
    {
        $boutiques = Boutique::with(['vendeur.user'])
            ->where('actif', true)
            ->paginate(15);

        return response()->json([
            'succes' => true,
            'boutiques' => $boutiques
        ]);
    }

    public function boutiquePublique($id)
    {
        $boutique = Boutique::with(['vendeur.user', 'produits' => function($query) {
            $query->where('actif', true)->where('disponible', true);
        }])->where('actif', true)->findOrFail($id);

        // Ajouter les URLs Google Maps
        $boutique->google_maps_url = $boutique->google_maps_url;
        $boutique->directions_url = $boutique->directions_url;
        $boutique->adresse_complete = $boutique->adresse_complete;

        return response()->json([
            'succes' => true,
            'boutique' => $boutique
        ]);
    }

    public function obtenirItineraire($id)
    {
        $boutique = Boutique::findOrFail($id);
        
        return response()->json([
            'succes' => true,
            'boutique' => [
                'id' => $boutique->id,
                'nom_boutique' => $boutique->nom_boutique,
                'adresse_complete' => $boutique->adresse_complete,
                'google_maps_url' => $boutique->google_maps_url,
                'directions_url' => $boutique->directions_url
            ]
        ]);
    }
}