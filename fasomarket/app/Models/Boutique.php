<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Boutique extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendeur_id',
        'nom_boutique',
        'slug',
        'description',
        'adresse',
        'ville',
        'quartier',
        'pays',
        'telephone',
        'whatsapp',
        'email',
        'logo',
        'banniere',
        'type_boutique',
        'livraison_disponible',
        'retrait_boutique',
        'horaires',
        'note_moyenne',
        'nombre_avis',
        'actif',
    ];

    protected $casts = [
        'horaires' => 'array',
        'note_moyenne' => 'decimal:2',
        'actif' => 'boolean',
        'livraison_disponible' => 'boolean',
        'retrait_boutique' => 'boolean',
    ];

    public function vendeur()
    {
        return $this->belongsTo(Vendeur::class);
    }

    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    public function avis()
    {
        return $this->hasManyThrough(Avis::class, Produit::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function getAdresseCompleteAttribute()
    {
        return trim("{$this->adresse}, {$this->ville}, {$this->pays}");
    }

    public function getGoogleMapsUrlAttribute()
    {
        $adresse = urlencode($this->adresse_complete);
        return "https://www.google.com/maps/search/?api=1&query={$adresse}";
    }

    public function getDirectionsUrlAttribute()
    {
        $destination = urlencode($this->adresse_complete);
        return "https://www.google.com/maps/dir/?api=1&destination={$destination}";
    }

    public function rechercherProximite($adresseRecherche, $rayon = 10)
    {
        // Recherche par ville et pays pour la proximité
        return self::where('ville', 'LIKE', "%{$this->ville}%")
                  ->orWhere('pays', 'LIKE', "%{$this->pays}%")
                  ->where('actif', true)
                  ->get();
    }
}
