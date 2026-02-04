<?php

namespace Database\Factories;

use App\Models\Jabatan;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Jabatan>
 */
class JabatanFactory extends Factory
{
    protected $model = Jabatan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'name' => $this->faker->unique()->randomElement([
                'Manager',
                'Supervisor',
                'Staff',
                'Team Lead',
                'Director',
                'Coordinator'
            ]),
            'description' => $this->faker->sentence(),
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
