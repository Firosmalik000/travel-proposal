<?php

namespace Database\Factories;

use App\Models\AgentPackageFee;
use App\Models\AgentProfile;
use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgentPackageFee>
 */
class AgentPackageFeeFactory extends Factory
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
            'fee_type' => 'fixed',
            'fee_value' => fake()->numberBetween(250000, 1500000),
            'is_active' => true,
        ];
    }
}
