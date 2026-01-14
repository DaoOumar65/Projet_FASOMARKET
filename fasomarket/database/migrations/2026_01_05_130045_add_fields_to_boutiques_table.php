<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->string('slug')->unique()->after('nom_boutique');
            $table->string('banniere')->nullable()->after('logo');
            $table->json('horaires')->nullable()->after('email');
            $table->decimal('note_moyenne', 3, 2)->default(0)->after('actif');
            $table->integer('nombre_avis')->default(0)->after('note_moyenne');
        });
    }

    public function down(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->dropColumn(['slug', 'banniere', 'horaires', 'note_moyenne', 'nombre_avis']);
        });
    }
};