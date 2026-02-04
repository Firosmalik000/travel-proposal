<?php

namespace Database\Factories;

use App\Models\SlipGaji;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SlipGaji>
 */
class SlipGajiFactory extends Factory
{
    protected $model = SlipGaji::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
            'period_label' => now()->format('F Y'),
            'pendapatan' => [
                ['name' => 'Gaji Pokok', 'amount' => 5000000],
                ['name' => 'Tunjangan', 'amount' => 1000000]
            ],
            'potongan' => [
                ['name' => 'BPJS', 'amount' => 100000],
                ['name' => 'PPh', 'amount' => 200000]
            ],
            'total_pendapatan' => 6000000,
            'total_potongan' => 300000,
            'gaji_bersih' => 5700000,
            'gaji_bersih_terbilang' => 'Lima Juta Tujuh Ratus Ribu Rupiah',
            'status' => $this->faker->randomElement(['draft', 'approved', 'sent']),
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
