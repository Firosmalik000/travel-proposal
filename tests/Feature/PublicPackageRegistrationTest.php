<?php

namespace Tests\Feature;

use App\Mail\NewPackageRegistrationSubmitted;
use App\Models\DepartureSchedule;
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
            'travel_package_id' => $package->id,
            'departure_date' => '2026-05-01',
            'return_date' => '2026-05-10',
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
        config()->set('services.booking.notification_email', 'admin@example.com');
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
            'price' => 34900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'travel_package_id' => $package->id,
            'departure_date' => '2026-06-10',
            'return_date' => '2026-06-20',
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
            'notes' => 'Mohon info kamar triple.',
        ])->assertRedirect(route('public.paket-register', ['travelPackage' => $package->slug]));

        $this->assertDatabaseHas('package_registrations', [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

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
}
