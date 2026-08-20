<?php

namespace Tests\Feature;

use App\Mail\NewPackageRegistrationSubmitted;
use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
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
            'price' => 27900000,
            'currency' => 'IDR',
            'image_path' => '/images/dummy.jpg',
            'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
            'content' => [],
            'is_active' => true,
        ]);

        DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->subDays(5)->toDateString(),
            'return_date' => now()->subDays(1)->toDateString(),
            'departure_city' => 'Surabaya',
            'seats_total' => 40,
            'seats_available' => 12,
            'status' => 'open',
            'is_active' => true,
        ]);

        DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->addDays(10)->toDateString(),
            'return_date' => now()->addDays(19)->toDateString(),
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 12,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->get(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/register/index')
                ->where('travelPackage.slug', 'umroh-hemat-9-hari')
                ->has('travelPackage.schedules', 1)
                ->where('travelPackage.schedules.0.departure_city', 'Jakarta'),
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
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->addDays(14)->toDateString(),
            'return_date' => now()->addDays(24)->toDateString(),
            'departure_city' => 'Surabaya',
            'seats_total' => 45,
            'seats_available' => 18,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'room_configuration' => [
                'single' => 0,
                'double' => 1,
                'triple' => 0,
                'quad' => 0,
            ],
            'notes' => 'Mohon info kamar triple.',
        ])->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]));
        $this->assertSessionHas('success');

        $this->assertDatabaseHas('package_registrations', [
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

        $registration = PackageRegistration::query()->firstOrFail();

        $this->assertSame([
            'single' => 0,
            'double' => 1,
            'triple' => 0,
            'quad' => 0,
        ], $registration->room_configuration);

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
        $package = TravelPackage::factory()->create();
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->addDays(14)->toDateString(),
            'return_date' => now()->addDays(24)->toDateString(),
            'departure_city' => 'Surabaya',
            'seats_total' => 45,
            'seats_available' => 18,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->from(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
                'departure_schedule_id' => $schedule->id,
                'full_name' => 'Ahmad Fauzi',
                'phone' => '081234567890',
                'email' => 'ahmad@example.com',
                'origin_city' => 'Gresik',
                'passenger_count' => 3,
                'room_configuration' => [
                    'single' => 0,
                    'double' => 1,
                    'triple' => 0,
                    'quad' => 0,
                ],
                'notes' => 'Mohon info kamar triple.',
            ])
            ->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertSessionHasErrors('room_configuration');
    }

    public function test_it_rejects_past_schedules_for_public_registration(): void
    {
        $package = TravelPackage::factory()->create();
        $pastSchedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->subDays(3)->toDateString(),
            'return_date' => now()->subDay()->toDateString(),
            'departure_city' => 'Surabaya',
            'seats_total' => 45,
            'seats_available' => 18,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->from(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->post(route('public.paket-register.store', ['travelPackage' => $package->slug]), [
                'departure_schedule_id' => $pastSchedule->id,
                'full_name' => 'Ahmad Fauzi',
                'phone' => '081234567890',
                'email' => 'ahmad@example.com',
                'origin_city' => 'Gresik',
                'passenger_count' => 2,
                'room_configuration' => [
                    'single' => 0,
                    'double' => 1,
                    'triple' => 0,
                    'quad' => 0,
                ],
                'notes' => 'Mohon info kamar triple.',
            ])
            ->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]))
            ->assertSessionHasErrors('departure_schedule_id');
    }
}
