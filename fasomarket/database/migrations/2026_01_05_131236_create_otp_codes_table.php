<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('telephone');
            $table->string('code', 6);
            $table->enum('type', ['inscription', 'connexion']);
            $table->boolean('verifie')->default(false);
            $table->timestamp('expire_a');
            $table->timestamps();
            
            $table->index(['telephone', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};