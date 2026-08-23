<?php

namespace App\Models;

use Database\Factories\AgentReferralVisitFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentReferralVisit extends Model
{
    /** @use HasFactory<AgentReferralVisitFactory> */
    use HasFactory;

    protected $fillable = ['agent_profile_id', 'visitor_hash', 'landing_path', 'visited_on', 'visit_count'];

    protected function casts(): array
    {
        return ['visit_count' => 'integer'];
    }

    public function agentProfile(): BelongsTo
    {
        return $this->belongsTo(AgentProfile::class);
    }
}
