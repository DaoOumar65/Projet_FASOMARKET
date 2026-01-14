<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'vendeur_id',
        'produit_id',
        'commande_id',
        'sujet',
        'archivee',
        'derniere_activite',
    ];

    protected $casts = [
        'archivee' => 'boolean',
        'derniere_activite' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function dernierMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    public function messagesNonLus()
    {
        return $this->hasMany(Message::class)->where('lu', false);
    }
}