<?php

namespace App\Models;

use Database\Factories\PackageDraftFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageDraft extends Model
{
    /** @use HasFactory<PackageDraftFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_id',
        'draft_key',
        'payload',
        'temporary_images',
        'base_package_updated_at',
        'last_autosaved_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'temporary_images' => 'array',
            'base_package_updated_at' => 'datetime',
            'last_autosaved_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }
}
