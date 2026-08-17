<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PackageVendor extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'name',
        'phone',
    ];

    public function pricePeriods(): HasMany
    {
        return $this->hasMany(VendorPricePeriod::class)->orderBy('start_date');
    }

    public function packageConfigs(): HasMany
    {
        return $this->hasMany(PackageAllInConfig::class);
    }
}
