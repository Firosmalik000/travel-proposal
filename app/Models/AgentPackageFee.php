<?php

namespace App\Models;

use Database\Factories\AgentPackageFeeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentPackageFee extends Model
{
    /** @use HasFactory<AgentPackageFeeFactory> */
    use HasFactory;

    protected $fillable = ['agent_profile_id', 'package_id', 'fee_type', 'fee_value', 'is_active'];

    protected function casts(): array
    {
        return ['fee_value' => 'decimal:2', 'is_active' => 'boolean'];
    }

    public function agentProfile(): BelongsTo
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }
}
