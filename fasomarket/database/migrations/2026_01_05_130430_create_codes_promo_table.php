<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('codes_promo', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('type', ['pourcentage', 'montant_fixe']);
            $table->decimal('valeur', 10, 2);
            $table->decimal('montant_minimum', 10, 2)->nullable();
            $table->integer('limite_utilisation')->nullable();
            $table->integer('utilisations')->default(0);
            $table->datetime('date_debut');
            $table->datetime('date_fin');
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('codes_promo');
    }
};