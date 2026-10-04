<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorServiceUsage extends Model
{
    use HasAuditTrail;

    protected $fillable = ['vendor_bill_id', 'package_id', 'usage_date', 'amount_idr', 'notes', 'idempotency_key', 'payload_hash', 'financial_transaction_id'];

    protected function casts(): array
    {
        return ['usage_date' => 'date', 'amount_idr' => 'integer'];
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(VendorBill::class, 'vendor_bill_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }
}
