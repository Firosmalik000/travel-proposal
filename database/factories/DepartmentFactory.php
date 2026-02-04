<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'name' => $this->faker->unique()->randomElement([
                'Human Resources',
                'Finance',
                'Information Technology',
                'Marketing',
                'Operations',
                'Sales',
                'Customer Service'
            ]),
            'description' => $this->faker->sentence(),
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
