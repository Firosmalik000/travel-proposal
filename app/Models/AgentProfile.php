<?php

namespace App\Models;

use Database\Factories\AgentProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentProfile extends Model
{
    /** @use HasFactory<AgentProfileFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'referral_code', 'phone', 'bank_name', 'bank_account_name', 'bank_account_number', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function packageFees(): HasMany
    {
        return $this->hasMany(AgentPackageFee::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(AgentCommission::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function referralVisits(): HasMany
    {
        return $this->hasMany(AgentReferralVisit::class);
    }
}
