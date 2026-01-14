<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_commande',
        'user_id',
        'montant_total',
        'statut',
        'adresse_livraison',
        'ville_livraison',
        'telephone_livraison',
        'notes',
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function detailsCommandes()
    {
        return $this->hasMany(DetailCommande::class);
    }

    public static function genererNumeroCommande()
    {
        do {
            $numero = 'CMD' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('numero_commande', $numero)->exists());
        
        return $numero;
    }
}
