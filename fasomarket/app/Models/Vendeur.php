<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vendeur extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'identifiant_vendeur',
        'nom_entreprise',
        'description',
        'numero_registre_commerce',
        'statut',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function boutiques()
    {
        return $this->hasMany(Boutique::class);
    }

    public static function genererIdentifiantVendeur()
    {
        do {
            $identifiant = 'VND' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('identifiant_vendeur', $identifiant)->exists());
        
        return $identifiant;
    }
}
