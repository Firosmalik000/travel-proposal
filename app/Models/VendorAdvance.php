<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorAdvance extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = ['package_vendor_id', 'currency', 'amount_idr', 'applied_amount_idr', 'status', 'advance_date', 'idempotency_key', 'payload_hash', 'financial_transaction_id', 'notes'];

    protected function casts(): array
    {
        return ['advance_date' => 'date', 'amount_idr' => 'integer', 'applied_amount_idr' => 'integer'];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(PackageVendor::class, 'package_vendor_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(VendorAdvanceAllocation::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }

    public function remainingAmount(): int
    {
        return max(0, (int) $this->amount_idr - (int) $this->applied_amount_idr);
    }
}
