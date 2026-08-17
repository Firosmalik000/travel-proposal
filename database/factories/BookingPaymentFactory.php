<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\BookingPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookingPayment>
 */
class BookingPaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => Booking::query()->value('id'),
            'payment_date' => fake()->date(),
            'amount' => fake()->numberBetween(1_000_000, 20_000_000),
            'payment_method' => fake()->randomElement(['transfer', 'cash']),
            'reference_number' => fake()->optional()->bothify('PAY-####'),
            'notes' => fake()->optional()->sentence(),
            'status' => 'confirmed',
        ];
    }
}
