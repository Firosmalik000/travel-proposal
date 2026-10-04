<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripOperationalTransition extends Model
{
    use HasAuditTrail;

    protected $fillable = [
        'package_id', 'from_status', 'to_status', 'occurred_date', 'revenue_amount_idr',
        'checklist_snapshot', 'notes', 'idempotency_key', 'payload_hash',
        'financial_transaction_id', 'reversal_financial_transaction_id', 'approved_by',
        'approved_at', 'reversed_by', 'reversed_at', 'reversal_reason',
    ];

    protected function casts(): array
    {
        return [
            'occurred_date' => 'date', 'revenue_amount_idr' => 'integer',
            'checklist_snapshot' => 'array', 'approved_at' => 'datetime', 'reversed_at' => 'datetime',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }
}
