<?php

namespace Database\Factories;

use App\Models\AgentProfile;
use App\Models\AgentReferralVisit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgentReferralVisit>
 */
class AgentReferralVisitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'agent_profile_id' => AgentProfile::factory(),
            'visitor_hash' => hash('sha256', fake()->uuid()),
            'landing_path' => '/paket-umroh',
            'visited_on' => today(),
            'visit_count' => 1,
        ];
    }
}
