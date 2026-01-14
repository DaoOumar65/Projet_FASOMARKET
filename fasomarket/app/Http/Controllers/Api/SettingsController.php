<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'telephone' => 'sometimes|required|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['nom', 'prenom', 'email', 'telephone']));

        return response()->json([
            'succes' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }

    public function updateBusinessInfo(Request $request)
    {
        $user = $request->user();
        
        if ($user->type_utilisateur !== 'vendeur') {
            return response()->json([
                'succes' => false,
                'message' => 'Seuls les vendeurs peuvent modifier les informations d\'entreprise'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_entreprise' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'numero_registre_commerce' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $vendeur = $user->vendeur;
        if ($vendeur) {
            $vendeur->update($request->only(['nom_entreprise', 'description', 'numero_registre_commerce']));
        }

        return response()->json([
            'succes' => true,
            'message' => 'Informations d\'entreprise mises à jour avec succès',
            'vendeur' => $vendeur
        ]);
    }

    public function updateNotificationSettings(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'email_nouvelles_commandes' => 'sometimes|boolean',
            'email_messages_clients' => 'sometimes|boolean',
            'email_rapports_ventes' => 'sometimes|boolean',
            'sms_commandes_urgentes' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succes' => false,
                'message' => 'Erreurs de validation',
                'erreurs' => $validator->errors()
            ], 422);
        }

        $settings = UserSetting::firstOrCreate(['user_id' => $user->id]);
        $settings->update($request->all());

        return response()->json([
            'succes' => true,
            'message' => 'Paramètres de notification mis à jour avec succès',
            'settings' => $settings
        ]);
    }
}