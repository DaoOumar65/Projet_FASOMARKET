<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = [
        'boutique_id',
        'categorie_id',
        'nom',
        'description',
        'categorie',
        'sous_categorie',
        'prix',
        'prix_promo',
        'quantite_stock',
        'stock_disponible',
        'unite_mesure',
        'marque',
        'etat',
        'couleurs_disponibles',
        'tailles_disponibles',
        'materiaux',
        'origine',
        'garantie',
        'livraison_gratuite',
        'est_en_promotion',
        'est_featured',
        'stock_alert_seuil',
        'images',
        'disponible',
        'actif',
        'vedette',
        'vues',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'prix_promo' => 'decimal:2',
        'couleurs_disponibles' => 'array',
        'tailles_disponibles' => 'array',
        'images' => 'array',
        'disponible' => 'boolean',
        'actif' => 'boolean',
        'vedette' => 'boolean',
        'livraison_gratuite' => 'boolean',
        'est_en_promotion' => 'boolean',
        'est_featured' => 'boolean',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function detailsCommandes()
    {
        return $this->hasMany(DetailCommande::class);
    }

    public function avis()
    {
        return $this->hasMany(Avis::class);
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class);
    }

    public function estEnFavori($userId)
    {
        return $this->favoris()->where('user_id', $userId)->exists();
    }

    public function calculerNoteMoyenne()
    {
        $noteMoyenne = $this->avis()->where('actif', true)->avg('note');
        return $noteMoyenne ? round($noteMoyenne, 1) : 0;
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function variantes()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function attributs()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function getEstNouveauAttribute()
    {
        return $this->created_at->gte(now()->subDays(7));
    }

    public function incrementerVues()
    {
        $this->increment('vues');
    }

    public function produitImages()
    {
        return $this->hasMany(ProduitImage::class)->orderBy('ordre');
    }
}
