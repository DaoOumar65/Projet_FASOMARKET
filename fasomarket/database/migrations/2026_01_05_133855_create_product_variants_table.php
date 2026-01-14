<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->string('nom');
            $table->string('sku')->unique();
            $table->decimal('prix', 10, 2)->nullable();
            $table->integer('quantite_stock')->default(0);
            $table->json('options'); // {"couleur": "Rouge", "taille": "L"}
            $table->string('image_url')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};