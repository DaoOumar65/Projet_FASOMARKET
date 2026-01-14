<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Avis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'produit_id',
        'commande_id',
        'note',
        'commentaire',
        'images',
        'recommande',
        'verifie',
        'actif',
    ];

    protected $casts = [
        'images' => 'array',
        'recommande' => 'boolean',
        'verifie' => 'boolean',
        'actif' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}