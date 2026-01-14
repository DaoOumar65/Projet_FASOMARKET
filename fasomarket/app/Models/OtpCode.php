<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class OtpCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'telephone',
        'code',
        'type',
        'verifie',
        'expire_a',
    ];

    protected $casts = [
        'verifie' => 'boolean',
        'expire_a' => 'datetime',
    ];

    public static function generer($telephone, $type = 'inscription')
    {
        // Supprimer les anciens codes non vérifiés
        self::where('telephone', $telephone)
            ->where('verifie', false)
            ->delete();

        // Générer nouveau code
        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        return self::create([
            'telephone' => $telephone,
            'code' => $code,
            'type' => $type,
            'expire_a' => Carbon::now()->addMinutes(5),
        ]);
    }

    public function estValide()
    {
        return !$this->verifie && $this->expire_a > now();
    }

    public function marquerVerifie()
    {
        $this->update(['verifie' => true]);
    }
}