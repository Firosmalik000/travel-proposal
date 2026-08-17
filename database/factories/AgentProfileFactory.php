<?php

namespace Database\Factories;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AgentProfile>
 */
class AgentProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'referral_code' => strtoupper(fake()->unique()->bothify('AGENT-####')),
            'phone' => fake()->numerify('62812########'),
            'bank_name' => fake()->randomElement(['BCA', 'BNI', 'BRI', 'Mandiri']),
            'bank_account_name' => fake()->name(),
            'bank_account_number' => fake()->numerify('##########'),
            'is_active' => true,
        ];
    }
}
