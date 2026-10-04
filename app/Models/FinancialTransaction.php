<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Database\Factories\FinancialTransactionFactory;
use DomainException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FinancialTransaction extends Model
{
    /** @use HasFactory<FinancialTransactionFactory> */
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'transaction_number',
        'transaction_date',
        'transaction_type',
        'category_code',
        'status',
        'source_type',
        'source_id',
        'package_id',
        'currency',
        'exchange_rate',
        'amount_original',
        'amount_idr',
        'idempotency_key',
        'payload_hash',
        'reversal_of_id',
        'adjustment_of_id',
        'adjustment_reason',
        'description',
        'posted_by',
        'posted_at',
        'reversed_by',
        'reversed_at',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'exchange_rate' => 'decimal:8',
            'amount_original' => 'decimal:4',
            'amount_idr' => 'integer',
            'posted_at' => 'datetime',
            'reversed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (FinancialTransaction $transaction): void {
            if (in_array($transaction->getOriginal('status'), ['posted', 'reversed'], true)) {
                throw new DomainException('Transaksi yang sudah diposting bersifat tetap dan tidak dapat diedit.');
            }
        });

        static::deleting(function (FinancialTransaction $transaction): void {
            if (in_array($transaction->status, ['posted', 'reversed'], true)) {
                throw new DomainException('Transaksi yang sudah diposting tidak dapat dihapus. Gunakan reversal.');
            }
        });
    }

    public function lines(): HasMany
    {
        return $this->hasMany(FinancialTransactionLine::class);
    }

    public function typeDefinition(): BelongsTo
    {
        return $this->belongsTo(FinancialTransactionType::class, 'category_code', 'code');
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function reversalOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reversal_of_id');
    }

    public function reversal(): HasOne
    {
        return $this->hasOne(self::class, 'reversal_of_id');
    }

    public function adjustmentOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'adjustment_of_id');
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(self::class, 'adjustment_of_id');
    }

    public function postedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function reversedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reversed_by');
    }
}
