<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = ['code',         'name',         'description',         'sort_order',         'is_active'];

    protected function casts(): array
    {
        return ['name' => 'array',             'description' => 'array',             'sort_order' => 'integer',             'is_active' => 'boolean'];
    }

    public function packageItineraries(): HasMany
    {
        return $this->hasMany(PackageItinerary::class);
    }
}
