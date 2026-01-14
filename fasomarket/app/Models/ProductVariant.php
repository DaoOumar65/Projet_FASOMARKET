<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'produit_id',
        'nom',
        'sku',
        'prix',
        'quantite_stock',
        'options',
        'image_url',
        'actif',
    ];

    protected $casts = [
        'options' => 'array',
        'prix' => 'decimal:2',
        'actif' => 'boolean',
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function getPrixFinalAttribute()
    {
        return $this->prix ?? $this->produit->prix;
    }
}