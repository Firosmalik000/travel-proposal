<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorBill extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'package_vendor_id', 'package_id', 'vendor_invoice_number', 'bill_date', 'due_date',
        'currency', 'amount_original', 'amount_idr', 'paid_amount_idr', 'status',
        'idempotency_key', 'payload_hash', 'posted_financial_transaction_id', 'notes',
    ];

    protected function casts(): array
    {
        return ['bill_date' => 'date', 'due_date' => 'date', 'amount_original' => 'decimal:4', 'amount_idr' => 'integer', 'paid_amount_idr' => 'integer'];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(PackageVendor::class, 'package_vendor_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(VendorBillPayment::class);
    }

    public function serviceUsages(): HasMany
    {
        return $this->hasMany(VendorServiceUsage::class);
    }

    public function postedTransaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'posted_financial_transaction_id');
    }

    public function remainingAmount(): int
    {
        return max(0, (int) $this->amount_idr - (int) $this->paid_amount_idr);
    }
}
