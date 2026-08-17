<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_code' => strtoupper(fake()->unique()->bothify('BK-######')),
            'customer_id' => User::factory(),
            'package_id' => TravelPackage::factory(),
            'booking_type' => 'regular',
            'full_name' => fake()->name(),
            'phone' => fake()->numerify('62812########'),
            'email' => fake()->safeEmail(),
            'origin_city' => fake()->city(),
            'passenger_count' => 1,
            'room_configuration' => ['single' => 1, 'double' => 0, 'triple' => 0, 'quad' => 0],
            'agreed_total_amount' => 25000000,
            'agreed_currency' => 'IDR',
            'status' => 'registered',
        ];
    }
}
