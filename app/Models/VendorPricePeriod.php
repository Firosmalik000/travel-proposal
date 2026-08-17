<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorPricePeriod extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'package_vendor_id',
        'label',
        'start_date',
        'end_date',
        'currency',
        'price_per_pax',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'price_per_pax' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(PackageVendor::class, 'package_vendor_id');
    }

    public function packageConfigs(): HasMany
    {
        return $this->hasMany(PackageAllInConfig::class);
    }
}
