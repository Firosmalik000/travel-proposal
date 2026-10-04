<?php

namespace App\Models;

use Database\Factories\AgentCommissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AgentCommission extends Model
{
    /** @use HasFactory<AgentCommissionFactory> */
    use HasFactory;

    protected $fillable = [
        'agent_profile_id', 'booking_id', 'package_id', 'fee_type', 'fee_value',
        'base_amount', 'commission_amount', 'currency', 'status', 'approved_at',
        'paid_at', 'notes', 'financial_account_id', 'payment_date',
        'exchange_rate', 'amount_idr',
    ];

    protected function casts(): array
    {
        return [
            'fee_value' => 'decimal:2',
            'base_amount' => 'integer',
            'commission_amount' => 'integer',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
            'payment_date' => 'date',
            'exchange_rate' => 'decimal:8',
            'amount_idr' => 'integer',
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

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function financialTransactions(): MorphMany
    {
        return $this->morphMany(FinancialTransaction::class, 'source');
    }
}
