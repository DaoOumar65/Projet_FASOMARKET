<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('produits', function (Blueprint $table) {
            if (!Schema::hasColumn('produits', 'sous_categorie')) {
                $table->string('sous_categorie', 100)->nullable()->after('categorie');
            }
            if (!Schema::hasColumn('produits', 'stock_disponible')) {
                $table->integer('stock_disponible')->default(0)->after('prix_promo');
            }
            if (!Schema::hasColumn('produits', 'unite_mesure')) {
                $table->string('unite_mesure', 50)->default('piece')->after('stock_disponible');
            }
            if (!Schema::hasColumn('produits', 'marque')) {
                $table->string('marque', 100)->nullable()->after('unite_mesure');
            }
            if (!Schema::hasColumn('produits', 'etat')) {
                $table->enum('etat', ['neuf', 'comme_neuf', 'tres_bon_etat', 'bon_etat', 'usage'])->default('neuf')->after('marque');
            }
            if (!Schema::hasColumn('produits', 'couleurs_disponibles')) {
                $table->json('couleurs_disponibles')->nullable()->after('etat');
            }
            if (!Schema::hasColumn('produits', 'tailles_disponibles')) {
                $table->json('tailles_disponibles')->nullable()->after('couleurs_disponibles');
            }
            if (!Schema::hasColumn('produits', 'materiaux')) {
                $table->string('materiaux')->nullable()->after('tailles_disponibles');
            }
            if (!Schema::hasColumn('produits', 'origine')) {
                $table->string('origine', 100)->default('Burkina Faso')->after('materiaux');
            }
            if (!Schema::hasColumn('produits', 'garantie')) {
                $table->string('garantie', 100)->nullable()->after('origine');
            }
            if (!Schema::hasColumn('produits', 'livraison_gratuite')) {
                $table->boolean('livraison_gratuite')->default(false)->after('garantie');
            }
            if (!Schema::hasColumn('produits', 'est_en_promotion')) {
                $table->boolean('est_en_promotion')->default(false)->after('livraison_gratuite');
            }
            if (!Schema::hasColumn('produits', 'est_featured')) {
                $table->boolean('est_featured')->default(false)->after('est_en_promotion');
            }
            if (!Schema::hasColumn('produits', 'stock_alert_seuil')) {
                $table->integer('stock_alert_seuil')->default(5)->after('est_featured');
            }
        });

        // Créer la table produit_images si elle n'existe pas
        if (!Schema::hasTable('produit_images')) {
            Schema::create('produit_images', function (Blueprint $table) {
                $table->id();
                $table->foreignId('produit_id')->constrained()->onDelete('cascade');
                $table->string('url', 500);
                $table->string('alt_text')->nullable();
                $table->integer('ordre')->default(0);
                $table->boolean('est_principale')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('produit_images');
        Schema::table('produits', function (Blueprint $table) {
            $columns = ['sous_categorie', 'stock_disponible', 'unite_mesure', 'marque', 'etat', 
                       'couleurs_disponibles', 'tailles_disponibles', 'materiaux', 'origine', 
                       'garantie', 'livraison_gratuite', 'est_en_promotion', 'est_featured', 'stock_alert_seuil'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('produits', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};