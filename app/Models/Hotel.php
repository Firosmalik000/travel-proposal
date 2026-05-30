<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hotel extends Model
{
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'country_id',
        'city_id',
        'product_id',
        'name',
        'code',
        'description',
        'currency',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(HotelCountry::class, 'country_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(HotelCity::class, 'city_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(TravelProduct::class, 'product_id');
    }

    public function prices(): HasMany
    {
        return $this->hasMany(HotelPrice::class, 'hotel_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(HotelAssignment::class, 'hotel_id');
    }
}
