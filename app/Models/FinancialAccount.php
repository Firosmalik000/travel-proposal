<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Database\Factories\FinancialAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialAccount extends Model
{
    /** @use HasFactory<FinancialAccountFactory> */
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'is_cash_account',
        'cash_account_type',
        'account_number',
        'currency',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_cash_account' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function transactionLines(): HasMany
    {
        return $this->hasMany(FinancialTransactionLine::class);
    }

    public function usesDebitNormalBalance(): bool
    {
        return in_array($this->type, ['asset', 'expense'], true);
    }
}
