<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialBudgetLine extends Model
{
    protected $fillable = ['financial_account_id', 'planned_amount_idr', 'notes'];

    protected function casts(): array
    {
        return ['planned_amount_idr' => 'integer'];
    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(FinancialBudget::class, 'financial_budget_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'financial_account_id');
    }
}
