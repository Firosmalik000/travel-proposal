<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Cashflow;
use App\Models\TravelPackage;
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

    public function test_manual_cashflow_creation_is_retired_in_favour_of_the_ledger(): void
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

        $response->assertRedirect()->assertSessionHasErrors('cashflow');
        $this->assertDatabaseCount('cashflows', 0);
        $this->assertDatabaseCount('cashflow_attachments', 0);
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

    public function test_legacy_cashflow_cannot_be_updated_or_deleted(): void
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
            ->assertRedirect()
            ->assertSessionHasErrors('cashflow');

        $this->assertDatabaseHas('cashflows', [
            'id' => $cashflow->id,
            'type' => 'income',
            'amount' => 700000,
        ]);

        $this->actingAs($user)
            ->delete(route('cashflow.destroy', $cashflow))
            ->assertRedirect()
            ->assertSessionHasErrors('cashflow');

        $this->assertDatabaseHas('cashflows', ['id' => $cashflow->id, 'deleted_at' => null]);
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

    public function test_system_generated_cashflow_cannot_be_updated_or_deleted_directly(): void
    {
        Storage::fake('public');
        $user = $this->createUserWithCashflowPermissions(['edit', 'delete']);
        $package = TravelPackage::factory()->create();
        $booking = Booking::query()->create([
            'booking_code' => 'BK-CASHFLOW-LOCK-001',
            'package_id' => $package->id,
            'booking_type' => 'regular',
            'full_name' => 'Customer Cashflow Lock',
            'phone' => '628123456789',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'status' => 'registered',
            'agreed_total_amount' => 25_000_000,
            'agreed_currency' => 'IDR',
        ]);
        $cashflow = Cashflow::factory()->create([
            'transaction_date' => '2026-09-07',
            'type' => 'income',
            'amount' => 5_000_000,
            'category' => 'booking_payment',
        ]);
        BookingPayment::factory()->for($booking)->create([
            'cashflow_id' => $cashflow->id,
            'payment_date' => '2026-09-07',
            'amount' => 5_000_000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($user)->put(route('cashflow.update', $cashflow), [
            'transaction_date' => '2026-09-08',
            'type' => 'expense',
            'amount' => 1,
            'category' => 'Manipulasi',
            'attachments' => [UploadedFile::fake()->image('bukti.jpg')],
        ])->assertRedirect()->assertSessionHasErrors('cashflow');

        $this->actingAs($user)
            ->delete(route('cashflow.destroy', $cashflow))
            ->assertRedirect()
            ->assertSessionHasErrors('cashflow');

        $this->assertDatabaseHas('cashflows', [
            'id' => $cashflow->id,
            'transaction_date' => '2026-09-07',
            'type' => 'income',
            'amount' => 5_000_000,
            'category' => 'booking_payment',
            'deleted_at' => null,
        ]);
    }

    public function test_reserved_booking_payment_category_cannot_be_created_manually(): void
    {
        Storage::fake('public');
        $user = $this->createUserWithCashflowPermissions(['create']);

        $this->actingAs($user)->post(route('cashflow.store'), [
            'transaction_date' => '2026-09-07',
            'type' => 'income',
            'amount' => 5_000_000,
            'category' => 'booking_payment',
            'attachments' => [UploadedFile::fake()->image('bukti.jpg')],
        ])->assertSessionHasErrors('category');

        $this->assertDatabaseCount('cashflows', 0);

        $this->actingAs($user)->post(route('cashflow.store'), [
            'transaction_date' => '2026-09-07',
            'type' => 'income',
            'amount' => 5_000_000,
            'category' => ' Booking_Payment ',
            'attachments' => [UploadedFile::fake()->image('bukti-lain.jpg')],
        ])->assertSessionHasErrors('category');

        $this->assertDatabaseCount('cashflows', 0);
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
