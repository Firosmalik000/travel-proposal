<?php

namespace App\Models;

use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    use HasFactory;
    use NormalizesLocalizedStrings;

    protected $fillable = [
        'slug',
        'category',
        'title',
        'excerpt',
        'content',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function setTitleAttribute(mixed $value): void
    {
        $this->attributes['title'] = $this->normalizeLocalizedString($value);
    }

    public function setExcerptAttribute(mixed $value): void
    {
        $this->attributes['excerpt'] = $this->normalizeNullableLocalizedString($value);
    }
}
