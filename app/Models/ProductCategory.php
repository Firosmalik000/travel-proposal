<?php

namespace App\Models;

use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    use HasFactory;
    use NormalizesLocalizedStrings;

    protected $fillable = [
        'key',
        'name',
        'description',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function setNameAttribute(mixed $value): void
    {
        $this->attributes['name'] = $this->normalizeLocalizedString($value);
    }

    public function setDescriptionAttribute(mixed $value): void
    {
        $this->attributes['description'] = $this->normalizeNullableLocalizedString($value);
    }

    public function products(): HasMany
    {
        return $this->hasMany(TravelProduct::class, 'product_type', 'key');
    }
}
