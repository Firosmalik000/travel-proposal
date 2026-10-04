<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialTransactionType extends Model
{
    use HasAuditTrail;

    /** @var array<string, string> */
    public const DEFAULT_CODE_BY_TRANSACTION_TYPE = [
        'opening_balance' => 'opening_balance',
        'transfer' => 'inter_account_transfer',
        'manual_journal' => 'other_manual_journal',
        'booking_payment' => 'customer_receipt',
        'capital_contribution' => 'owner_capital',
        'owner_withdrawal' => 'owner_withdrawal',
        'operating_expense' => 'operating_expense',
        'other_income' => 'other_income',
        'customer_refund' => 'customer_refund',
        'agent_commission' => 'agent_commission',
        'inventory_purchase' => 'inventory',
        'inventory_issue' => 'inventory',
        'vendor_bill' => 'vendor_cost',
        'vendor_payment' => 'vendor_cost',
        'vendor_advance_payment' => 'vendor_cost',
        'vendor_advance_application' => 'vendor_cost',
        'vendor_service_use' => 'vendor_cost',
        'trip_revenue_recognition' => 'trip_revenue',
        'period_adjustment' => 'period_adjustment',
        'legacy_unclassified' => 'legacy_unclassified',
    ];

    protected $fillable = [
        'code',
        'name',
        'applies_to',
        'description',
        'is_active',
        'is_system',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_system' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class, 'category_code', 'code');
    }

    public static function defaultCodeFor(string $transactionType): string
    {
        return self::DEFAULT_CODE_BY_TRANSACTION_TYPE[$transactionType] ?? 'other_manual_journal';
    }
}
