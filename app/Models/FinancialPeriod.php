<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialPeriod extends Model
{
    use HasAuditTrail;

    protected $fillable = ['period_code', 'start_date', 'end_date', 'status'];

    protected function casts(): array
    {
        return ['start_date' => 'date', 'end_date' => 'date'];
    }

    public function events(): HasMany
    {
        return $this->hasMany(FinancialPeriodEvent::class);
    }
}
