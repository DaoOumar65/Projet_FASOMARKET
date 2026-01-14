<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('vendeur_id')->constrained('users');
            $table->foreignId('produit_id')->nullable()->constrained('produits');
            $table->foreignId('commande_id')->nullable()->constrained('commandes');
            $table->string('sujet')->nullable();
            $table->boolean('archivee')->default(false);
            $table->timestamp('derniere_activite');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};