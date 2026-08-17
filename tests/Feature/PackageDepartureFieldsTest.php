<?php

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackageDepartureFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_departure_period_and_seat_capacity_directly_on_a_package(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('packages.store'), $this->departurePackagePayload())
            ->assertSessionHasNoErrors();

        $package = TravelPackage::query()->where('slug', 'umroh-keberangkatan-langsung')->firstOrFail();

        $this->assertSame(now()->addMonth()->toDateString(), $package->start_date?->toDateString());
        $this->assertSame(now()->addMonth()->addDays(8)->toDateString(), $package->end_date?->toDateString());
        $this->assertSame('Jakarta', $package->departure_city);
        $this->assertSame(45, $package->seats_total);
        $this->assertSame(45, $package->availableSeatsCount());
        $this->assertSame('open', $package->booking_status);
        $this->assertFalse(DepartureSchedule::query()->where('package_id', $package->id)->exists());
    }

    public function test_it_rejects_an_invalid_package_departure_period_and_capacity(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('packages.store'), $this->departurePackagePayload([
                'end_date' => now()->addMonth()->subDay()->toDateString(),
                'seats_total' => 0,
            ]))
            ->assertSessionHasErrors(['end_date', 'seats_total']);
    }

    public function test_it_registers_against_package_capacity_without_selecting_a_schedule(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-DIRECT-09',
            'slug' => 'direct-registration',
            'name' => 'Direct Registration',
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonth()->addDays(8),
            'seats_total' => 2,
            'seats_available' => 1,
            'booking_status' => 'open',
            'duration_days' => 9,
            'price' => 30_000_000,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-DIRECT-001',
            'package_id' => $package->id,
            'full_name' => 'Existing Customer',
            'phone' => '081200000001',
            'email' => 'existing@example.test',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'room_configuration' => ['single' => 1, 'double' => 0, 'triple' => 0, 'quad' => 0],
            'status' => 'registered',
        ]);

        $this->post(route('public.paket-register.store', $package), [
            'full_name' => 'New Customer',
            'phone' => '081200000002',
            'email' => 'new@example.test',
            'origin_city' => 'Bandung',
            'passenger_count' => 2,
            'room_configuration' => ['single' => 0, 'double' => 1, 'triple' => 0, 'quad' => 0],
        ])->assertSessionHasErrors('passenger_count');

        $this->assertSame(1, $package->fresh()->availableSeatsCount());
    }

    /** @return array<string, mixed> */
    private function departurePackagePayload(array $overrides = []): array
    {
        return array_replace([
            'slug' => 'umroh-keberangkatan-langsung',
            'name' => ['id' => 'Umroh Keberangkatan Langsung', 'en' => 'Direct Departure Umrah'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'start_date' => now()->addMonth()->toDateString(),
            'end_date' => now()->addMonth()->addDays(8)->toDateString(),
            'seats_total' => 45,
            'booking_status' => 'open',
            'departure_notes' => 'Meeting point Terminal 3.',
            'duration_days' => 9,
            'price' => 30_000_000,
            'original_price' => null,
            'currency' => 'IDR',
            'summary' => ['id' => 'Paket test', 'en' => 'Test package'],
            'content' => [],
            'product_ids' => [],
            'itineraries' => [],
            'is_featured' => false,
            'is_active' => true,
        ], $overrides);
    }
}
