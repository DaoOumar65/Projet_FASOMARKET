<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendeur;
use App\Models\OtpCode;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthentificationController extends Controller
{
    protected $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function envoyerOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string|max:20',
            'type' => 'required|in:inscription,connexion'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $otpCode = OtpCode::generer($request->telephone, $request->type);
        $this->smsService->envoyerOtp($request->telephone, $otpCode->code);

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Code OTP envoyé',
            'expire_dans' => '5 minutes'
        ]);
    }

    public function verifierOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string|max:20',
            'code' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $otpCode = OtpCode::where('telephone', $request->telephone)
                         ->where('code', $request->code)
                         ->first();

        if (!$otpCode || !$otpCode->estValide()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Code OTP invalide ou expiré'
            ], 400);
        }

        $otpCode->marquerVerifie();

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Code OTP vérifié',
            'telephone_verifie' => true
        ]);
    }

    public function inscriptionClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:4|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'telephone' => $request->telephone,
            'type_utilisateur' => 'client',
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Inscription réussie',
            'user' => $user,
            'utilisateur' => $user,
            'token' => $token,
            'access_token' => $token
        ], 201);
    }

    public function inscriptionVendeur(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telephone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'nom_entreprise' => 'required|string|max:255',
            'description' => 'nullable|string',
            'numero_registre_commerce' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors(),
                'erreurs' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'type_utilisateur' => 'vendeur',
            'password' => Hash::make($request->password),
        ]);

        $vendeur = Vendeur::create([
            'user_id' => $user->id,
            'identifiant_vendeur' => Vendeur::genererIdentifiantVendeur(),
            'nom_entreprise' => $request->nom_entreprise,
            'description' => $request->description,
            'numero_registre_commerce' => $request->numero_registre_commerce,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Inscription vendeur réussie',
            'user' => $user,
            'utilisateur' => $user,
            'vendeur' => $vendeur,
            'token' => $token,
            'access_token' => $token
        ], 201);
    }

    public function connexion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifiant' => 'required|string', // email ou telephone
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Identifiant et mot de passe requis',
                'errors' => $validator->errors()
            ], 422);
        }

        $identifiant = $request->identifiant;
        $password = $request->password;
        
        // Chercher par email ou téléphone
        $user = User::where('email', $identifiant)
                   ->orWhere('telephone', $identifiant)
                   ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Identifiants incorrects'
            ], 401);
        }

        if (!$user->actif) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'message' => 'Compte désactivé'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = [
            'success' => true,
            'succes' => true,
            'message' => 'Connexion réussie',
            'user' => $user,
            'utilisateur' => $user,
            'token' => $token,
            'access_token' => $token
        ];

        if ($user->type_utilisateur === 'vendeur') {
            $response['vendeur'] = $user->vendeur;
        }

        return response()->json($response);
    }

    public function deconnexion(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function profil(Request $request)
    {
        $user = $request->user();
        $response = [
            'success' => true,
            'succes' => true,
            'user' => $user,
            'utilisateur' => $user
        ];

        if ($user->type_utilisateur === 'vendeur') {
            $response['vendeur'] = $user->vendeur;
        }

        return response()->json($response);
    }
}