<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'numero_ifu',
        'type_utilisateur',
        'password',
        'actif',
    ];

    protected $appends = ['role', 'type'];

    public function getRoleAttribute()
    {
        return $this->type_utilisateur;
    }

    public function getTypeAttribute()
    {
        return $this->type_utilisateur;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'actif' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vendeur()
    {
        return $this->hasOne(Vendeur::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function panier()
    {
        return $this->hasOne(Panier::class);
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class);
    }

    public function otpCodes()
    {
        return $this->hasMany(OtpCode::class, 'telephone', 'telephone');
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function conversationsClient()
    {
        return $this->hasMany(Conversation::class, 'client_id');
    }

    public function conversationsVendeur()
    {
        return $this->hasMany(Conversation::class, 'vendeur_id');
    }

    public function isVendeur()
    {
        return $this->type_utilisateur === 'vendeur';
    }

    public function isClient()
    {
        return $this->type_utilisateur === 'client';
    }
}
