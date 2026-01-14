<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthentificationController;
use App\Http\Controllers\Api\VendeurController;
use App\Http\Controllers\Api\BoutiqueController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\CommandeController;
use App\Http\Controllers\Api\CategorieController;
use App\Http\Controllers\Api\PanierController;
use App\Http\Controllers\Api\FavoriController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\DeliveryController;

// Routes d'authentification (publiques)
Route::post('/inscription-client', [AuthentificationController::class, 'inscriptionClient']);
Route::post('/inscription-vendeur', [AuthentificationController::class, 'inscriptionVendeur']);
Route::post('/connexion', [AuthentificationController::class, 'connexion']);
Route::post('/connexion-client', [AuthentificationController::class, 'connexion']);
Route::post('/envoyer-otp', [AuthentificationController::class, 'envoyerOtp']);
Route::post('/verifier-otp', [AuthentificationController::class, 'verifierOtp']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    // Authentification
    Route::post('/deconnexion', [AuthentificationController::class, 'deconnexion']);
    Route::get('/profil', [AuthentificationController::class, 'profil']);
    
    // Panier
    Route::get('/panier', [PanierController::class, 'index']);
    Route::post('/panier/ajouter', [PanierController::class, 'ajouter']);
    Route::patch('/panier/items/{id}', [PanierController::class, 'modifierQuantite']);
    Route::delete('/panier/items/{id}', [PanierController::class, 'supprimerItem']);
    Route::delete('/panier/vider', [PanierController::class, 'vider']);
    
    // Favoris
    Route::get('/favoris', [FavoriController::class, 'index']);
    Route::post('/favoris/{produit_id}', [FavoriController::class, 'ajouter']);
    Route::delete('/favoris/{produit_id}', [FavoriController::class, 'supprimer']);
    
    // Images
    Route::post('/{type}/{id}/images', [ImageController::class, 'store']);
    Route::delete('/images/{image}', [ImageController::class, 'destroy']);
    Route::patch('/images/{image}/order', [ImageController::class, 'updateOrder']);
    
    // Variantes de produits
    Route::get('/produits/{produit}/variantes', [ProductVariantController::class, 'index']);
    Route::post('/produits/{produit}/variantes', [ProductVariantController::class, 'store']);
    Route::put('/variantes/{variante}', [ProductVariantController::class, 'update']);
    Route::delete('/variantes/{variante}', [ProductVariantController::class, 'destroy']);
    
    // Conversations et messages
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
    Route::patch('/messages/{message}/marquer-lu', [ConversationController::class, 'markAsRead']);
    
    // Vendor Dashboard & Stats
    Route::get('/vendor/dashboard', [VendorController::class, 'dashboard']);
    Route::get('/vendor/stats', [StatsController::class, 'vendorStats']);
    Route::get('/vendor/recent-orders', [StatsController::class, 'recentOrders']);
    Route::get('/vendor/top-products', [StatsController::class, 'topProducts']);
    Route::get('/vendor/orders', [VendorController::class, 'orders']);
    Route::put('/vendor/orders/{commande}/status', [VendorController::class, 'updateOrderStatus']);
    Route::get('/vendor/clients', [VendorController::class, 'clients']);
    
    // Vendeurs
    Route::apiResource('vendeurs', VendeurController::class);
    
    // Boutiques
    Route::apiResource('boutiques', BoutiqueController::class);
    Route::get('/boutiques-par-localisation', [BoutiqueController::class, 'parLocalisation']);
    Route::get('/boutiques-vendeur/{vendeur}', [BoutiqueController::class, 'parVendeur']);
    Route::get('/boutiques/{id}/itineraire', [BoutiqueController::class, 'obtenirItineraire']);
    
    // Produits
    Route::apiResource('produits', ProduitController::class);
    Route::get('/produits-boutique/{boutique}', [ProduitController::class, 'parBoutique']);
    Route::get('/produits-categorie/{categorie}', [ProduitController::class, 'parCategorie']);
    Route::get('/rechercher-produits', [ProduitController::class, 'rechercher']);
    Route::get('/produits-vedettes', [ProduitController::class, 'vedettes']);
    
    // Commandes
    Route::apiResource('commandes', CommandeController::class);
    Route::post('/passer-commande', [CommandeController::class, 'passerCommande']);
    Route::put('/commandes/{commande}/statut', [CommandeController::class, 'changerStatut']);
    Route::get('/mes-commandes', [CommandeController::class, 'mesCommandes']);
    Route::get('/commandes-vendeur', [CommandeController::class, 'commandesVendeur']);
    
    // Catégories (gestion admin)
    Route::apiResource('categories', CategorieController::class)->except(['index']);
    
    // Analytics
    Route::get('/analytics/vendor', [AnalyticsController::class, 'vendor']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Settings
    Route::put('/profile', [SettingsController::class, 'updateProfile']);
    Route::put('/business-info', [SettingsController::class, 'updateBusinessInfo']);
    Route::put('/notification-settings', [SettingsController::class, 'updateNotificationSettings']);
    
    // Deliveries
    Route::get('/vendor/deliveries', [DeliveryController::class, 'index']);
    Route::put('/vendor/deliveries/{id}', [DeliveryController::class, 'update']);
    
    // Routes vendeur spécifiques
    Route::get('/dashboard-vendeur', [VendeurController::class, 'dashboard']);
    Route::get('/clients-vendeur', [VendeurController::class, 'clients']);
    Route::get('/notifications', [VendeurController::class, 'notifications']);
});

// Routes publiques pour l'exploration
Route::get('/boutiques-publiques', [BoutiqueController::class, 'boutiquesPubliques']);
Route::get('/produits-publics', [ProduitController::class, 'produitsPublics']);
Route::get('/boutique-publique/{id}', [BoutiqueController::class, 'boutiquePublique']);
Route::get('/produit-public/{id}', [ProduitController::class, 'produitPublic']);
Route::get('/categories', [CategorieController::class, 'index']);

// Routes pour la page d'accueil (publiques)
Route::get('/accueil/statistiques', [AccueilController::class, 'statistiques']);
Route::get('/accueil/produits-vedettes', [AccueilController::class, 'produitsVedettes']);
Route::get('/accueil/boutiques-populaires', [AccueilController::class, 'boutiquesPopulaires']);
Route::get('/accueil/categories-populaires', [AccueilController::class, 'categoriesPopulaires']);
Route::get('/accueil/nouveaux-produits', [AccueilController::class, 'nouveauxProduits']);
Route::get('/accueil/donnees-completes', [AccueilController::class, 'donneesAccueil']);

// Route de test temporaire
Route::middleware('auth:sanctum')->get('/test-commandes-vendeur', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'succes' => true,
        'message' => 'Test réussi',
        'user' => [
            'id' => $user->id,
            'type' => $user->type_utilisateur,
            'nom' => $user->nom,
            'prenom' => $user->prenom
        ],
        'commandes' => []
    ]);
});

// Route de test pour création catégorie
Route::middleware('auth:sanctum')->post('/test-categories', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'succes' => true,
        'message' => 'Test validation catégorie',
        'user_type' => $user->type_utilisateur,
        'donnees_recues' => $request->all(),
        'validation' => [
            'nom_present' => $request->has('nom'),
            'nom_valeur' => $request->input('nom'),
            'description_present' => $request->has('description')
        ]
    ]);
});