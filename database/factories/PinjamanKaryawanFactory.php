<?php

namespace Database\Factories;

use App\Models\PinjamanKaryawan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PinjamanKaryawan>
 */
class PinjamanKaryawanFactory extends Factory
{
    protected $model = PinjamanKaryawan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nominal' => $this->faker->randomFloat(2, 1000000, 10000000),
            'nama_bank' => $this->faker->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI']),
            'nomor_rekening' => $this->faker->numerify('##########'),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'is_approve' => false,
            'is_rejected' => false,
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
