<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    public const TYPE_TRAVEL_UPDATE = 'travel_update';

    public const TYPE_COMPANY_NEWS = 'company_news';

    public const TYPE_UMRAH_EDUCATION = 'umrah_education';

    public const TYPE_GENERAL_NEWS = 'general_news';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'body',
        'image_path',
        'content_type',
        'status',
        'author_name',
        'tags',
        'meta_title',
        'meta_description',
        'og_image_path',
        'reading_time_minutes',
        'views_count',
        'published_at',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'excerpt' => 'array',
            'body' => 'array',
            'tags' => 'array',
            'meta_title' => 'array',
            'meta_description' => 'array',
            'published_at' => 'datetime',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public static function contentTypeOptions(): array
    {
        return [
            self::TYPE_TRAVEL_UPDATE,
            self::TYPE_COMPANY_NEWS,
            self::TYPE_UMRAH_EDUCATION,
            self::TYPE_GENERAL_NEWS,
        ];
    }

    public static function statusOptions(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_SCHEDULED,
            self::STATUS_PUBLISHED,
            self::STATUS_ARCHIVED,
        ];
    }

    public function scopePublished($query)
    {
        return $query
            ->where('is_active', true)
            ->where('status', self::STATUS_PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeVisible($query)
    {
        return $query->published();
    }

    public function scopeFeatured($query)
    {
        return $query
            ->published()
            ->where('is_featured', true);
    }

    public function isVisible(): bool
    {
        return $this->is_active
            && $this->status === self::STATUS_PUBLISHED
            && $this->published_at !== null
            && $this->published_at->lte(now());
    }
}
