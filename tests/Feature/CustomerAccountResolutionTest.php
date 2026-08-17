<?php

namespace Tests\Feature;

use App\Actions\Customer\ResolveCustomerAccount;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomerAccountResolutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_customer_account_with_normalized_identity(): void
    {
        $customer = app(ResolveCustomerAccount::class)->handle('Ahmad Fauzi', ' Ahmad@Example.com ', '+62 812-3456-7890');

        $this->assertSame('ahmad@example.com', $customer->email);
        $this->assertTrue($customer->hasRole('Customer'));
        $this->assertSame('6281234567890', $customer->profile->phone);
        $this->assertSame(1, User::query()->count());
    }

    public function test_it_reuses_an_account_when_the_email_matches_even_if_the_phone_differs(): void
    {
        $resolver = app(ResolveCustomerAccount::class);
        $first = $resolver->handle('Ahmad', 'ahmad@example.com', '0811111111');
        $second = $resolver->handle('Ahmad Baru', 'AHMAD@example.com', '0822222222');

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, User::query()->count());
    }

    public function test_it_creates_a_different_account_when_only_the_phone_matches(): void
    {
        $resolver = app(ResolveCustomerAccount::class);
        $first = $resolver->handle('Ahmad', 'ahmad@example.com', '0811111111');
        $second = $resolver->handle('Budi', 'budi@example.com', '+62 811-111-111');

        $this->assertNotSame($first->id, $second->id);
        $this->assertSame(2, User::query()->count());
    }

    public function test_repeated_public_package_registrations_are_attached_to_the_same_customer(): void
    {
        Mail::fake();
        Http::fake();

        $package = TravelPackage::factory()->create([
            'start_date' => now()->addMonth()->toDateString(),
            'end_date' => now()->addMonth()->addDays(9)->toDateString(),
            'seats_total' => 40,
            'seats_available' => 40,
            'booking_status' => 'open',
        ]);

        $registrationData = [
            'full_name' => 'Ahmad Fauzi',
            'phone' => '0812-3456-7890',
            'email' => 'AHMAD@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 1,
            'room_configuration' => [
                'single' => 1,
                'double' => 0,
                'triple' => 0,
                'quad' => 0,
            ],
        ];

        $this->post(route('public.paket-register.store', $package), $registrationData)
            ->assertRedirect(route('public.paket-register', $package));

        $this->post(route('public.paket-register.store', $package), [
            ...$registrationData,
            'phone' => '+62 812 3456 7890',
            'email' => 'ahmad@example.com',
        ])->assertRedirect(route('public.paket-register', $package));

        $customer = User::query()->sole();
        $customerIds = PackageRegistration::query()->pluck('customer_id')->unique();

        $this->assertTrue($customer->hasRole('Customer'));
        $this->assertSame('6281234567890', $customer->profile->phone);
        $this->assertCount(1, $customerIds);
        $this->assertSame($customer->id, $customerIds->first());
        $this->assertDatabaseCount('package_registrations', 2);
    }
}
