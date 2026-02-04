<?php

namespace Database\Factories;

use App\Models\IzinKeluarKaryawan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IzinKeluarKaryawan>
 */
class IzinKeluarKaryawanFactory extends Factory
{
    protected $model = IzinKeluarKaryawan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'tanggal' => now(),
            'jam_keluar' => now()->setTime(9, 0),
            'jam_kembali' => now()->setTime(17, 0),
            'keterangan' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected', 'sudah_kembali']),
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
