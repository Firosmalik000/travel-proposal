<?php

namespace Database\Factories;

use App\Models\PackageDraft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PackageDraft> */
class PackageDraftFactory extends Factory
{
    protected $model = PackageDraft::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'package_id' => null,
            'draft_key' => 'create',
            'payload' => ['name' => ['id' => fake()->words(3, true)]],
            'temporary_images' => [],
            'base_package_updated_at' => null,
            'last_autosaved_at' => now(),
            'expires_at' => now()->addDays(30),
        ];
    }
}
