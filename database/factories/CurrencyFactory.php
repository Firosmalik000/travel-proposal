<?php

namespace Database\Factories;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Currency>
 */
class CurrencyFactory extends Factory
{
    protected $model = Currency::class;

    public function definition(): array
    {
        $codes = ['IDR', 'USD', 'SAR', 'EUR', 'MYR', 'SGD', 'AED', 'AUD', 'GBP', 'JPY'];
        $code = $this->faker->unique()->randomElement($codes);

        return [
            'code' => $code,
            'name' => match ($code) {
                'IDR' => 'Indonesian Rupiah',
                'USD' => 'US Dollar',
                'SAR' => 'Saudi Riyal',
                'EUR' => 'Euro',
                'MYR' => 'Malaysian Ringgit',
                'SGD' => 'Singapore Dollar',
                'AED' => 'UAE Dirham',
                'AUD' => 'Australian Dollar',
                'GBP' => 'Pound Sterling',
                'JPY' => 'Japanese Yen',
                default => $this->faker->word().' Currency',
            },
            'conversion_rate' => $this->faker->randomFloat(6, 0.1, 25000),
            'notes' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}
