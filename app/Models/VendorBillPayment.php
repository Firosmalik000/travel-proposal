<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorBillPayment extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = ['vendor_bill_id', 'amount_idr', 'payment_date', 'financial_account_id', 'financial_transaction_id', 'idempotency_key', 'payload_hash', 'notes'];

    protected function casts(): array
    {
        return ['payment_date' => 'date', 'amount_idr' => 'integer'];
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(VendorBill::class, 'vendor_bill_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'financial_account_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }
}
