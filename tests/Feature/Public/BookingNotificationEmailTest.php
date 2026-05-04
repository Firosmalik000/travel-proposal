<?php

namespace Tests\Feature\Public;

use App\Mail\NewCustomUmrohRequestSubmitted;
use App\Mail\NewPackageRegistrationSubmitted;
use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BookingNotificationEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_package_registration_notification_email_goes_to_admin_config(): void
    {
        Mail::fake();
        config()->set('services.notifications.admin_email', 'admin-notify@example.com');

        $package = TravelPackage::factory()->create();
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->addDays(10)->toDateString(),
            'return_date' => now()->addDays(19)->toDateString(),
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'notes' => null,
            'is_active' => true,
        ]);

        $this->post("/paket-umroh/{$package->slug}/daftar", [
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Customer Name',
            'phone' => '6281212345678',
            'email' => 'customer@example.com',
            'origin_city' => 'Bandung',
            'passenger_count' => 2,
            'notes' => 'Catatan',
        ])->assertRedirect();

        Mail::assertSent(NewPackageRegistrationSubmitted::class, function (NewPackageRegistrationSubmitted $mail): bool {
            return $mail->hasTo('admin-notify@example.com');
        });
    }

    public function test_custom_umroh_request_notification_email_goes_to_admin_config(): void
    {
        Mail::fake();
        config()->set('services.notifications.admin_email', 'admin-notify@example.com');

        $this->post('/custom-umroh', [
            'full_name' => 'Customer Name',
            'phone' => '6281212345678',
            'email' => 'customer@example.com',
            'origin_city' => 'Bandung',
            'passenger_count' => 4,
            'group_type' => 'family',
            'departure_month' => '2026-06',
            'budget' => 100000000,
            'focus' => 'ibadah',
            'room_preference' => 'quad',
            'notes' => 'Catatan',
        ])->assertRedirect();

        Mail::assertSent(NewCustomUmrohRequestSubmitted::class, function (NewCustomUmrohRequestSubmitted $mail): bool {
            return $mail->hasTo('admin-notify@example.com');
        });
    }
}
