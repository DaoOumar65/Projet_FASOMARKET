<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProduitImage extends Model
{
    protected $fillable = [
        'produit_id', 'url', 'alt_text', 'ordre', 'est_principale'
    ];

    protected $casts = [
        'est_principale' => 'boolean',
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}