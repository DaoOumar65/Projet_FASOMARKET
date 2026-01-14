<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('boutiques', function (Blueprint $table) {
            if (!Schema::hasColumn('boutiques', 'quartier')) {
                $table->string('quartier', 100)->nullable()->after('ville');
            }
            if (!Schema::hasColumn('boutiques', 'whatsapp')) {
                $table->string('whatsapp', 20)->nullable()->after('telephone');
            }
            if (!Schema::hasColumn('boutiques', 'type_boutique')) {
                $table->enum('type_boutique', ['physique', 'en_ligne', 'hybride'])->default('physique')->after('email');
            }
            if (!Schema::hasColumn('boutiques', 'livraison_disponible')) {
                $table->boolean('livraison_disponible')->default(false)->after('type_boutique');
            }
            if (!Schema::hasColumn('boutiques', 'retrait_boutique')) {
                $table->boolean('retrait_boutique')->default(true)->after('livraison_disponible');
            }
        });
    }

    public function down()
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->dropColumn(['quartier', 'whatsapp', 'type_boutique', 'livraison_disponible', 'retrait_boutique']);
        });
    }
};