<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'slug',
        'name',
        'package_type',
        'departure_city',
        'duration_days',
        'price',
        'currency',
        'image_path',
        'summary',
        'content',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'summary' => 'array',
            'content' => 'array',
            'price' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DepartureSchedule::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(TravelProduct::class, 'travel_package_product')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }
}
