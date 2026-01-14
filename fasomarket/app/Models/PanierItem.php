<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PanierItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'panier_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
        'sous_total',
        'message_vendeur',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'sous_total' => 'decimal:2',
    ];

    public function panier()
    {
        return $this->belongsTo(Panier::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->sous_total = $item->prix_unitaire * $item->quantite;
        });

        static::saved(function ($item) {
            $item->panier->calculerTotaux();
        });

        static::deleted(function ($item) {
            $item->panier->calculerTotaux();
        });
    }
}