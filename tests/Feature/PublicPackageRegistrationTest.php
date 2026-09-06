<?php

namespace Tests\Feature;

use App\Mail\NewPackageRegistrationSubmitted;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Services\PackageRoomConfigurationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPackageRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_the_public_package_registration_form(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-HEMAT-09',
            'slug' => 'umroh-hemat-9-hari',
            'name' => ['id' => 'Umroh Hemat 9 Hari', 'en' => 'Economy Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(18)->toDateString(),
            'seats_total' => 40,
            'booking_status' => 'open',
            'price' => 27900000,
            'currency' => 'IDR',
            'image_path' => '/images/dummy.jpg',
            'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
            'content' => [
                'room_prices' => ['dbl' => 27_900_000, 'trpl' => 26_900_000, 'quad' => 25_900_000],
            ],
            'is_active' => true,
        ]);

        $this->get(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/register/index')
                ->where('travelPackage.slug', 'umroh-hemat-9-hari')
                ->where('travelPackage.departure_city', 'Jakarta')
                ->where('travelPackage.room_prices.double', 27_900_000),
            );
    }

    public function test_it_stores_a_public_package_registration(): void
    {
        Mail::fake();
        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'detail' => 'success! message in queue',
            ], 200),
        ]);
        config()->set('services.notifications.admin_email', 'admin@example.com');
        config()->set('services.booking.whatsapp.admin_number', '081234567890');
        config()->set('services.booking.whatsapp.token', 'fonnte-test-token');
        config()->set('services.booking.whatsapp.endpoint', 'https://api.fonnte.com/send');

        $package = TravelPackage::query()->create([
            'code' => 'ASF-REG-10',
            'slug' => 'umroh-reguler-10-hari',
            'name' => ['id' => 'Umroh Reguler 10 Hari', 'en' => 'Regular Umrah 10 Days'],
            'package_type' => 'reguler',
            'departure_city' => 'Surabaya',
            'duration_days' => 10,
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(23)->toDateString(),
            'seats_total' => 45,
            'booking_status' => 'open',
            'price' => 34900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
            'content' => [
                'room_prices' => [
                    'dbl' => 34_900_000,
                    'trpl' => 33_900_000,
                    'quad' => 32_900_000,
                ],
            ],
            'is_active' => true,
        ]);

        $response = $this->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 10,
            'room_configuration_unit' => 'pax',
            'room_configuration' => [
                'double' => 2,
                'triple' => 0,
                'quad' => 8,
            ],
            'notes' => 'Mohon info kamar triple.',
        ]);
        $response
            ->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('package_registrations', [
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 10,
            'status' => 'pending',
        ]);

        $registration = PackageRegistration::query()->firstOrFail();

        $this->assertEquals([
            'unit' => 'pax',
            'double' => 2,
            'triple' => 0,
            'quad' => 8,
        ], $registration->room_configuration);
        $this->assertSame(
            333_000_000.0,
            app(PackageRoomConfigurationService::class)->calculateTotalAmount(
                $package,
                $registration->room_configuration,
                $registration->passenger_count,
            ),
        );

        Mail::assertSent(NewPackageRegistrationSubmitted::class, function (NewPackageRegistrationSubmitted $mail): bool {
            return $mail->hasTo('admin@example.com')
                && $mail->registration->full_name === 'Ahmad Fauzi';
        });

        Http::assertSent(function ($request): bool {
            return $request->url() === 'https://api.fonnte.com/send'
                && $request->hasHeader('Authorization', 'fonnte-test-token')
                && $request['target'] === '081234567890'
                && str_contains((string) $request['message'], 'Ahmad Fauzi');
        });
    }

    public function test_it_shows_the_success_state_after_registration_redirect(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-REG-11',
            'slug' => 'umroh-reguler-success',
            'name' => ['id' => 'Umroh Reguler Success', 'en' => 'Regular Umrah Success'],
            'package_type' => 'reguler',
            'departure_city' => 'Surabaya',
            'duration_days' => 10,
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(23)->toDateString(),
            'seats_total' => 45,
            'booking_status' => 'open',
            'price' => 34900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $this->withSession([
            'success' => 'Terima kasih, pendaftaran Anda telah kami terima. Admin akan menghubungi Anda maksimal 7 x 24 jam.',
        ])
            ->get(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/register/index')
                ->where('flash.success', 'Terima kasih, pendaftaran Anda telah kami terima. Admin akan menghubungi Anda maksimal 7 x 24 jam.'));
    }

    public function test_it_rejects_invalid_room_composition_for_public_registration(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(23)->toDateString(),
            'seats_total' => 45,
            'booking_status' => 'open',
        ]);

        $this->from(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
                'full_name' => 'Ahmad Fauzi',
                'phone' => '081234567890',
                'email' => 'ahmad@example.com',
                'origin_city' => 'Gresik',
                'passenger_count' => 3,
                'room_configuration' => [
                    'double' => 1,
                    'triple' => 0,
                    'quad' => 0,
                ],
                'notes' => 'Mohon info kamar triple.',
            ])
            ->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertSessionHasErrors('room_configuration');
    }

    public function test_it_rejects_a_public_pax_allocation_that_does_not_match_the_passenger_count(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(23)->toDateString(),
            'seats_total' => 45,
            'booking_status' => 'open',
        ]);

        $this->from(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
                'full_name' => 'Ahmad Fauzi',
                'phone' => '081234567890',
                'email' => 'ahmad@example.com',
                'origin_city' => 'Gresik',
                'passenger_count' => 10,
                'room_configuration_unit' => 'pax',
                'room_configuration' => [
                    'double' => 1,
                    'triple' => 0,
                    'quad' => 8,
                ],
            ])
            ->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertSessionHasErrors('room_configuration');
    }

    public function test_it_rejects_a_package_with_a_past_departure(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => now()->subDays(3)->toDateString(),
            'end_date' => now()->subDay()->toDateString(),
            'seats_total' => 45,
            'booking_status' => 'open',
        ]);

        $this->from(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
                'full_name' => 'Ahmad Fauzi',
                'phone' => '081234567890',
                'email' => 'ahmad@example.com',
                'origin_city' => 'Gresik',
                'passenger_count' => 2,
                'room_configuration' => [
                    'double' => 1,
                    'triple' => 0,
                    'quad' => 0,
                ],
                'notes' => 'Mohon info kamar triple.',
            ])
            ->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertSessionHasErrors('passenger_count');
    }
}
