<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PackageItinerary extends Model
{
    protected $fillable = [
        'package_id',
        'activity_id',
        'activity_ids',
        'day_number',
        'sort_order',
        'title',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'day_number' => 'integer',
            'sort_order' => 'integer',
            'activity_ids' => 'array',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(TravelProduct::class, 'package_itinerary_product', 'package_itinerary_id', 'product_id')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }
}
