<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Panier extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sous_total',
        'total',
        'code_promo',
        'reduction_promo',
        'points_fidelite_utilises',
        'reduction_points',
        'expire_le',
    ];

    protected $casts = [
        'sous_total' => 'decimal:2',
        'total' => 'decimal:2',
        'reduction_promo' => 'decimal:2',
        'reduction_points' => 'decimal:2',
        'expire_le' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PanierItem::class);
    }

    public function calculerTotaux()
    {
        $this->sous_total = $this->items->sum('sous_total');
        $this->total = $this->sous_total - $this->reduction_promo - $this->reduction_points;
        $this->save();
    }
}