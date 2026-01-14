<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paniers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('sous_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->string('code_promo')->nullable();
            $table->decimal('reduction_promo', 10, 2)->default(0);
            $table->integer('points_fidelite_utilises')->default(0);
            $table->decimal('reduction_points', 10, 2)->default(0);
            $table->timestamp('expire_le')->nullable();
            $table->timestamps();
        });

        Schema::create('panier_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('panier_id')->constrained()->onDelete('cascade');
            $table->foreignId('produit_id')->constrained()->onDelete('cascade');
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('sous_total', 10, 2);
            $table->text('message_vendeur')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panier_items');
        Schema::dropIfExists('paniers');
    }
};