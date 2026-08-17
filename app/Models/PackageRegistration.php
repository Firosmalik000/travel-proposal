<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageRegistration extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'package_id',
        'customer_id',
        'agent_profile_id',
        'referral_code',
        'departure_schedule_id',
        'full_name',
        'phone',
        'email',
        'origin_city',
        'passenger_count',
        'room_configuration',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'passenger_count' => 'integer',
            'room_configuration' => 'array',
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

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class);
    }

    public function travelPackage(): BelongsTo
    {
        return $this->package();
    }
}
