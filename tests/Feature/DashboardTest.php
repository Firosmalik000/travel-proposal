<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\PageContent;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_guests_are_redirected_to_login_page(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_dashboard(): void
    {
        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertOk();
    }

    public function test_dashboard_stats_return_travel_summary(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-001',
            'slug' => 'umroh-reguler',
            'name' => ['id' => 'Umroh Reguler', 'en' => 'Regular Umrah'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 35000000,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        DepartureSchedule::query()->create([
            'departure_date' => now()->addMonth()->toDateString(),
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 9,
            'status' => 'open',
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-DASH-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Dashboard Revenue',
            'phone' => '081299999999',
            'email' => null,
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'notes' => null,
            'status' => 'registered',
        ]);

        PageContent::query()->create([
            'slug' => 'home',
            'category' => 'page',
            'title' => ['id' => 'Home', 'en' => 'Home'],
            'is_active' => true,
        ]);

        Article::query()->create([
            'title' => 'Artikel',
            'slug' => 'artikel',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->getJson(route('dashboard.stats', [], false));

        $response->assertSuccessful()
            ->assertJsonPath('activePackages.value', 1)
            ->assertJsonPath('upcomingDepartures.value', 1);

        $this->assertGreaterThanOrEqual(2, (int) $response->json('publishedContent.value'));
        $this->assertSame(70000000.0, (float) $response->json('estimatedRevenue.value'));
    }

    public function test_dashboard_monthly_growth_and_weekly_activity_have_expected_shape(): void
    {
        $this->actingAs($this->user)
            ->getJson(route('dashboard.monthly-growth', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['month', 'users', 'departures'],
            ]);

        $this->actingAs($this->user)
            ->getJson(route('dashboard.weekly-activity', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['day', 'departures', 'contents'],
            ]);
    }

    public function test_dashboard_distribution_and_upcoming_departures_are_returned(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-002',
            'slug' => 'umroh-premium',
            'name' => ['id' => 'Umroh Premium', 'en' => 'Premium Umrah'],
            'package_type' => 'premium',
            'departure_city' => 'Surabaya',
            'duration_days' => 12,
            'price' => 45000000,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        DepartureSchedule::query()->create([
            'travel_package_id' => $package->id,
            'departure_date' => now()->addDays(10)->toDateString(),
            'departure_city' => 'Surabaya',
            'seats_total' => 30,
            'seats_available' => 7,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($this->user)
            ->getJson(route('dashboard.department-distribution', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['name', 'value', 'color'],
            ]);

        $this->actingAs($this->user)
            ->getJson(route('dashboard.birthdays', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['title', 'departure_date', 'departure_city', 'seats_available'],
            ]);
    }

    public function test_dashboard_operational_endpoints_have_expected_shape(): void
    {
        $this->actingAs($this->user)
            ->getJson(route('dashboard.recent-activity', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['text', 'color'],
            ]);

        $this->actingAs($this->user)
            ->getJson(route('dashboard.pending-tasks', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['label', 'value', 'color'],
            ]);

        $this->actingAs($this->user)
            ->getJson(route('dashboard.system-status', [], false))
            ->assertSuccessful()
            ->assertJsonStructure([
                '*' => ['label', 'status', 'color'],
            ]);
    }
}
