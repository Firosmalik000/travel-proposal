<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageAllInConfig extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'package_id',
        'package_vendor_id',
        'vendor_price_period_id',
        'broker_package_name',
        'currency',
        'price_per_pax',
        'included_category_keys',
        'vendor_name_snapshot',
        'period_label_snapshot',
        'period_start_snapshot',
        'period_end_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'price_per_pax' => 'decimal:2',
            'included_category_keys' => 'array',
            'period_start_snapshot' => 'date',
            'period_end_snapshot' => 'date',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(PackageVendor::class, 'package_vendor_id');
    }

    public function pricePeriod(): BelongsTo
    {
        return $this->belongsTo(VendorPricePeriod::class, 'vendor_price_period_id');
    }
}
