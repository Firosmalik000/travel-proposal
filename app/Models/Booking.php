<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'booking_code',
        'customer_id',
        'agent_profile_id',
        'referral_code',
        'package_id',
        'departure_schedule_id',
        'booking_type',
        'custom_departure_date',
        'custom_return_date',
        'custom_unit_price',
        'custom_total_amount',
        'custom_currency',
        'agreed_total_amount',
        'agreed_currency',
        'full_name',
        'phone',
        'email',
        'origin_city',
        'passenger_count',
        'room_configuration',
        'notes',
        'status',
        'participant_data_locked_at',
    ];

    protected function casts(): array
    {
        return [
            'passenger_count' => 'integer',
            'room_configuration' => 'array',
            'custom_departure_date' => 'date',
            'custom_return_date' => 'date',
            'custom_unit_price' => 'integer',
            'custom_total_amount' => 'integer',
            'agreed_total_amount' => 'integer',
            'participant_data_locked_at' => 'datetime',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function agentProfile(): BelongsTo
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function agentCommission(): HasOne
    {
        return $this->hasOne(AgentCommission::class);
    }

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class);
    }

    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonial::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(BookingParticipant::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BookingPayment::class);
    }

    public function confirmedPayments(): HasMany
    {
        return $this->payments()->where('status', 'confirmed');
    }
}
