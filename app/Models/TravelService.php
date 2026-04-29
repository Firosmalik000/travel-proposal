<?php

namespace App\Models;

use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelService extends Model
{
    use HasFactory;
    use NormalizesLocalizedStrings;

    protected $table = 'services';

    protected $fillable = [
        'title',
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

    public function setTitleAttribute(mixed $value): void
    {
        $this->attributes['title'] = $this->normalizeLocalizedString($value);
    }

    public function setDescriptionAttribute(mixed $value): void
    {
        $this->attributes['description'] = $this->normalizeNullableLocalizedString($value);
    }
}
