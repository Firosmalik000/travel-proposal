<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UserReviewToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'recruitment_id',
        'user_email',
        'used',
        'expires_at',
    ];

    protected $casts = [
        'used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the recruitment that owns the token.
     */
    public function recruitment(): BelongsTo
    {
        return $this->belongsTo(Recruitment::class);
    }

    /**
     * Generate a new token for user review.
     */
    public static function generate(int $recruitmentId, string $userEmail): self
    {
        return self::create([
            'token' => Str::random(64),
            'recruitment_id' => $recruitmentId,
            'user_email' => $userEmail,
            'expires_at' => now()->addDays(7), // Token valid for 7 days
        ]);
    }

    /**
     * Check if token is valid.
     */
    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }

    /**
     * Mark token as used.
     */
    public function markAsUsed(): void
    {
        $this->update(['used' => true]);
    }
}
