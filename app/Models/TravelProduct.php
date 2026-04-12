<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TravelProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'product_type',
        'description',
        'content',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'content' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(TravelPackage::class, 'travel_package_product')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }
}
