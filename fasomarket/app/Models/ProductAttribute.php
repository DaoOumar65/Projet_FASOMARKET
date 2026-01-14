<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'produit_id',
        'attribute_key',
        'attribute_value',
        'attribute_group',
        'order',
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}