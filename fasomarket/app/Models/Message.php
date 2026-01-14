<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'expediteur_id',
        'contenu',
        'pieces_jointes',
        'lu',
        'lu_a',
    ];

    protected $casts = [
        'pieces_jointes' => 'array',
        'lu' => 'boolean',
        'lu_a' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function marquerLu()
    {
        $this->update([
            'lu' => true,
            'lu_a' => now()
        ]);
    }
}