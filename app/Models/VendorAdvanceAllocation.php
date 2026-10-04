<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorAdvanceAllocation extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = ['vendor_advance_id', 'vendor_bill_id', 'amount_idr', 'allocation_date', 'idempotency_key', 'payload_hash', 'financial_transaction_id', 'notes'];

    protected function casts(): array
    {
        return ['allocation_date' => 'date', 'amount_idr' => 'integer'];
    }

    public function advance(): BelongsTo
    {
        return $this->belongsTo(VendorAdvance::class, 'vendor_advance_id');
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
