<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CodePromo extends Model
{
    use HasFactory;

    protected $table = 'codes_promo';

    protected $fillable = [
        'code',
        'nom',
        'description',
        'type',
        'valeur',
        'montant_minimum',
        'limite_utilisation',
        'utilisations',
        'date_debut',
        'date_fin',
        'actif',
    ];

    protected $casts = [
        'valeur' => 'decimal:2',
        'montant_minimum' => 'decimal:2',
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'actif' => 'boolean',
    ];

    public function estValide($montantCommande = 0)
    {
        if (!$this->actif) return false;
        if (now() < $this->date_debut || now() > $this->date_fin) return false;
        if ($this->limite_utilisation && $this->utilisations >= $this->limite_utilisation) return false;
        if ($this->montant_minimum && $montantCommande < $this->montant_minimum) return false;
        
        return true;
    }

    public function calculerReduction($montant)
    {
        if (!$this->estValide($montant)) return 0;

        if ($this->type === 'pourcentage') {
            return ($montant * $this->valeur) / 100;
        }

        return $this->valeur;
    }
}