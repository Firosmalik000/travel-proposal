<?php

namespace App\Actions\Agent;

use App\Models\AgentProfile;
use App\Models\AgentReferralVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class RecordAgentReferralVisit
{
    /**
     * Record an agent referral visit from a visitor.
     */
    public function handle(Request $request, AgentProfile $agent): void
    {
        $visitorToken = $request->cookie('agent_referral_visitor') ?: Str::uuid()->toString();
        $visit = AgentReferralVisit::query()->firstOrCreate([
            'agent_profile_id' => $agent->id,
            'visitor_hash' => hash('sha256', $visitorToken),
            'visited_on' => today()->toDateString(),
        ], [
            'landing_path' => '/'.ltrim($request->path(), '/'),
            'visit_count' => 1,
        ]);

        if (! $visit->wasRecentlyCreated) {
            $visit->increment('visit_count');
            $visit->update(['landing_path' => '/'.ltrim($request->path(), '/')]);
        }

        Cookie::queue('agent_referral_visitor', $visitorToken, 60 * 24 * 365);
    }
}
