<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\MasterKaryawan;
use App\Models\Department;
use App\Models\Jabatan;
use App\Models\SlipGaji;
use App\Models\IzinKeluarKaryawan;
use App\Models\PinjamanKaryawan;
use App\Models\Recruitment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($this->user);

        $this->get(route('dashboard'))->assertOk();
    }

    public function test_dashboard_stats_endpoint_returns_correct_structure()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'totalUsers' => ['value', 'growth', 'description'],
                'activeEmployees' => ['value', 'newThisMonth', 'description'],
                'departments' => ['value', 'description'],
                'todayActivity' => ['value', 'description']
            ]);
    }

    public function test_dashboard_monthly_growth_endpoint_returns_array()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/dashboard/monthly-growth');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['month', 'users', 'karyawan']
            ]);

        $data = $response->json();
        $this->assertCount(6, $data); // Should return 6 months
    }

    public function test_dashboard_department_distribution_endpoint()
    {
        $this->actingAs($this->user);

        // Create department with employees
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        MasterKaryawan::factory()->create([
            'user_id' => $this->user->id,
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id,
            'is_active' => true
        ]);

        $response = $this->getJson('/api/dashboard/department-distribution');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['name', 'value', 'color']
            ]);
    }

    public function test_dashboard_weekly_activity_endpoint()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/dashboard/weekly-activity');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['day', 'logins', 'documents']
            ]);

        $data = $response->json();
        $this->assertCount(7, $data); // Should return 7 days
    }

    public function test_dashboard_recent_activity_endpoint()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/dashboard/recent-activity');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['text', 'color']
            ]);
    }

    public function test_dashboard_pending_tasks_endpoint()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/dashboard/pending-tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['label', 'value', 'color']
            ]);

        $data = $response->json();
        $this->assertCount(4, $data); // Should return 4 task types
    }

    public function test_dashboard_system_status_endpoint()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/dashboard/system-status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['label', 'status', 'color']
            ]);
    }

    public function test_dashboard_stats_calculates_user_growth_correctly()
    {
        $this->actingAs($this->user);

        // Create additional users
        User::factory()->count(5)->create();

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertGreaterThanOrEqual(6, $data['totalUsers']['value']); // At least 6 users (1 auth + 5 created)
    }

    public function test_dashboard_counts_active_employees_correctly()
    {
        $this->actingAs($this->user);

        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        // Create active employees
        MasterKaryawan::factory()->count(3)->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id,
            'is_active' => true
        ]);

        // Create inactive employee
        MasterKaryawan::factory()->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id,
            'is_active' => false
        ]);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertEquals(3, $data['activeEmployees']['value']);
    }

    public function test_dashboard_counts_pending_tasks_correctly()
    {
        $this->actingAs($this->user);

        // Create pending izin keluar
        IzinKeluarKaryawan::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending'
        ]);

        // Create pending pinjaman
        PinjamanKaryawan::factory()->create([
            'user_id' => $this->user->id,
            'is_approve' => false,
            'is_rejected' => false
        ]);

        $response = $this->getJson('/api/dashboard/pending-tasks');

        $response->assertStatus(200);

        $data = $response->json();

        // Find pending izin keluar
        $pendingIzin = collect($data)->firstWhere('label', 'Izin Keluar Menunggu Approval');
        $this->assertEquals(1, $pendingIzin['value']);

        // Find pending pinjaman
        $pendingPinjaman = collect($data)->firstWhere('label', 'Pinjaman Menunggu Approval');
        $this->assertEquals(1, $pendingPinjaman['value']);
    }
}
