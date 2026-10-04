<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankReconciliation extends Model
{
    use HasAuditTrail;

    protected $fillable = [
        'financial_account_id', 'statement_date', 'statement_balance_idr', 'ledger_balance_idr',
        'difference_idr', 'status', 'notes', 'idempotency_key', 'payload_hash',
        'reconciled_by', 'reconciled_at',
    ];

    protected function casts(): array
    {
        return [
            'statement_date' => 'date',
            'statement_balance_idr' => 'integer',
            'ledger_balance_idr' => 'integer',
            'difference_idr' => 'integer',
            'reconciled_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'financial_account_id');
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
