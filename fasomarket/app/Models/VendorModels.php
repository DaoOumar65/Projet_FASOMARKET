<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'titre', 'message', 'lu'
    ];

    protected $casts = [
        'lu' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

class UserSetting extends Model
{
    protected $fillable = [
        'user_id', 'email_nouvelles_commandes', 'email_messages_clients',
        'email_rapports_ventes', 'sms_commandes_urgentes', 'push_notifications'
    ];

    protected $casts = [
        'email_nouvelles_commandes' => 'boolean',
        'email_messages_clients' => 'boolean',
        'email_rapports_ventes' => 'boolean',
        'sms_commandes_urgentes' => 'boolean',
        'push_notifications' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}