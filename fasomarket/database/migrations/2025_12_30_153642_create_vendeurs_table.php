<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendeurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('identifiant_vendeur')->unique(); // ID unique pour chaque vendeur
            $table->string('nom_entreprise');
            $table->text('description')->nullable();
            $table->string('numero_registre_commerce')->nullable();
            $table->enum('statut', ['en_attente', 'approuve', 'suspendu'])->default('en_attente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendeurs');
    }
};
