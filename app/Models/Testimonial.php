<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'origin_city',
        'travel_package_id',
        'quote',
        'rating',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'quote' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function travelPackage(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class);
    }
}
