<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'path',
        'url',
        'thumbnail_url',
        'order',
        'is_primary',
        'alt_text',
        'mime_type',
        'size',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function imageable()
    {
        return $this->morphTo();
    }
}