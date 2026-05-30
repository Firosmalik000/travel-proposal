<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Cashflow;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CashflowManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(LogAdminActivityMiddleware::class);
    }

    public function test_it_can_open_cashflow_page(): void
    {
        $user = $this->createUserWithCashflowPermissions(['view']);

        $this->actingAs($user)
            ->get(route('cashflow.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/Cashflow/Index')
                ->has('cashflows')
                ->has('filters')
                ->has('summary')
            );
    }

    public function test_it_can_create_cashflow_with_multiple_attachments(): void
    {
        Storage::fake('public');
        $user = $this->createUserWithCashflowPermissions(['create']);

        $response = $this->actingAs($user)
            ->post(route('cashflow.store'), [
                'transaction_date' => '2026-05-26',
                'type' => 'income',
                'amount' => 1500000,
                'category' => 'Operasional',
                'description' => 'Pembayaran DP',
                'attachments' => [
                    UploadedFile::fake()->image('nota-1.jpg'),
                    UploadedFile::fake()->image('nota-2.jpg'),
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cashflows', [
            'type' => 'income',
            'amount' => 1500000,
            'category' => 'Operasional',
        ]);
        $this->assertDatabaseCount('cashflow_attachments', 2);
    }

    public function test_it_can_filter_and_return_summary_data(): void
    {
        $user = $this->createUserWithCashflowPermissions(['view']);
        Cashflow::factory()->create([
            'transaction_date' => '2026-05-20',
            'type' => 'income',
            'amount' => 2000000,
            'category' => 'Operasional',
        ]);
        Cashflow::factory()->create([
            'transaction_date' => '2026-05-22',
            'type' => 'expense',
            'amount' => 500000,
            'category' => 'Marketing',
        ]);

        $this->actingAs($user)
            ->get(route('cashflow.index', [
                'date_start' => '2026-05-19',
                'date_end' => '2026-05-21',
                'type' => 'income',
                'category' => 'Operasional',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.total_income', 2000000)
                ->where('summary.total_expense', 0)
                ->where('summary.balance', 2000000)
                ->has('cashflows', 1)
            );
    }

    public function test_it_can_update_and_delete_cashflow(): void
    {
        Storage::fake('public');
        $user = $this->createUserWithCashflowPermissions(['edit', 'delete']);
        $cashflow = Cashflow::factory()->create([
            'type' => 'income',
            'amount' => 700000,
        ]);
        $cashflow->attachments()->create([
            'file_path' => '/storage/cashflows/existing.jpg',
            'file_name' => 'existing.jpg',
            'file_size' => 1024,
        ]);

        $this->actingAs($user)
            ->put(route('cashflow.update', $cashflow), [
                'transaction_date' => '2026-05-26',
                'type' => 'expense',
                'amount' => 900000,
                'category' => 'Transport',
                'description' => 'Update transaksi',
                'attachments' => [UploadedFile::fake()->image('nota-baru.jpg')],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('cashflows', [
            'id' => $cashflow->id,
            'type' => 'expense',
            'amount' => 900000,
            'category' => 'Transport',
        ]);

        $this->actingAs($user)
            ->delete(route('cashflow.destroy', $cashflow))
            ->assertRedirect();

        $this->assertSoftDeleted('cashflows', ['id' => $cashflow->id]);
    }

    public function test_it_can_export_cashflow_pdf_with_filters(): void
    {
        $user = $this->createUserWithCashflowPermissions(['export']);

        Cashflow::factory()->create([
            'transaction_date' => '2026-05-20',
            'type' => 'income',
            'amount' => 1000000,
            'category' => 'Operasional',
        ]);

        $this->actingAs($user)
            ->get(route('cashflow.pdf', [
                'date_start' => '2026-05-19',
                'date_end' => '2026-05-21',
                'type' => 'income',
                'category' => 'Operasional',
            ]))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    /**
     * @param  array<int, string>  $actions
     */
    private function createUserWithCashflowPermissions(array $actions): User
    {
        $user = User::factory()->create();

        foreach ($actions as $action) {
            $permission = Permission::query()->firstOrCreate([
                'name' => 'menu.cashflow.'.$action,
                'guard_name' => 'web',
            ]);
            $user->givePermissionTo($permission);
        }

        return $user;
    }
}
