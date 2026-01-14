<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vendor_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->date('date');
            $table->decimal('revenue', 10, 2)->default(0);
            $table->integer('orders_count')->default(0);
            $table->integer('products_sold')->default(0);
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('type', 50);
            $table->string('titre');
            $table->text('message');
            $table->boolean('lu')->default(false);
            $table->timestamps();
        });

        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->boolean('email_nouvelles_commandes')->default(true);
            $table->boolean('email_messages_clients')->default(true);
            $table->boolean('email_rapports_ventes')->default(true);
            $table->boolean('sms_commandes_urgentes')->default(false);
            $table->boolean('push_notifications')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('vendor_analytics');
    }
};