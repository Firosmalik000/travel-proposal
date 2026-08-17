<?php

namespace App\Models;

use Database\Factories\AgentCommissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentCommission extends Model
{
    /** @use HasFactory<AgentCommissionFactory> */
    use HasFactory;

    protected $fillable = [
        'agent_profile_id', 'booking_id', 'package_id', 'fee_type', 'fee_value',
        'base_amount', 'commission_amount', 'currency', 'status', 'approved_at',
        'paid_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'fee_value' => 'decimal:2',
            'base_amount' => 'integer',
            'commission_amount' => 'integer',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function agentProfile(): BelongsTo
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }
}
