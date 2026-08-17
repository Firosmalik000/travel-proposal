<?php

namespace Database\Factories;

use App\Models\AgentCommission;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgentCommission>
 */
class AgentCommissionFactory extends Factory
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
            'package_id' => TravelPackage::factory(),
            'booking_id' => fn (array $attributes): int => Booking::factory()->create([
                'agent_profile_id' => $attributes['agent_profile_id'],
                'package_id' => $attributes['package_id'],
            ])->id,
            'fee_type' => 'fixed',
            'fee_value' => 500000,
            'base_amount' => 25000000,
            'commission_amount' => 500000,
            'currency' => 'IDR',
            'status' => 'pending',
        ];
    }
}
