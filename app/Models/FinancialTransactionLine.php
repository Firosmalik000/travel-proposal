<?php

namespace App\Models;

use Database\Factories\FinancialTransactionLineFactory;
use DomainException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransactionLine extends Model
{
    /** @use HasFactory<FinancialTransactionLineFactory> */
    use HasFactory;

    protected $fillable = [
        'financial_account_id',
        'entry_type',
        'amount_original',
        'amount_idr',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'amount_original' => 'decimal:4',
            'amount_idr' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        $ensureDraft = function (FinancialTransactionLine $line): void {
            if ($line->transaction()->whereIn('status', ['posted', 'reversed'])->exists()) {
                throw new DomainException('Baris transaksi posted bersifat tetap dan tidak dapat diubah.');
            }
        };

        static::creating($ensureDraft);
        static::updating($ensureDraft);
        static::deleting($ensureDraft);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'financial_account_id');
    }
}
