<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\PackageVendor;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use App\Models\VendorBill;
use App\Models\VendorBillPayment;
use App\Services\FinancialLedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class FinancialReceivableTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(LogAdminActivityMiddleware::class);
    }

    public function test_receivable_workspace_tracks_paid_and_remaining_amount_per_booking(): void
    {
        $user = $this->financeUser();
        $package = TravelPackage::factory()->create([
            'code' => 'TRIP-PIUTANG',
            'start_date' => '2026-12-10',
        ]);
        $booking = Booking::factory()->for($package, 'package')->create([
            'booking_code' => 'BK-TRACK-001',
            'full_name' => 'Jemaah Tracking',
            'agreed_total_amount' => 25_000_000,
        ]);
        $account = FinancialAccount::query()->where('system_key', 'customer_funds')->firstOrFail();
        BookingPayment::query()->create([
            'booking_id' => $booking->id,
            'financial_account_id' => $account->id,
            'payment_date' => '2026-10-01',
            'amount' => 10_000_000,
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_idr' => 10_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
            'idempotency_key' => 'receivable-payment-001',
        ]);

        $this->actingAs($user)
            ->get(route('financial.receivables.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/Receivables/Index')
                ->where('summary.bookings', 1)
                ->where('summary.partial', 1)
                ->where('summary.remaining_amount_idr', 15_000_000)
                ->has('receivables.data', 1)
                ->where('receivables.data.0.booking_code', 'BK-TRACK-001')
                ->where('receivables.data.0.paid_amount', 10_000_000)
                ->where('receivables.data.0.remaining_amount', 15_000_000)
                ->where('receivables.data.0.payment_status', 'partial')
                ->where('receivables.data.0.last_payment_account', '1001 · Rekening Penampungan Jemaah'));
    }

    public function test_receivable_workspace_can_filter_overdue_bookings(): void
    {
        $user = $this->financeUser();
        $pastPackage = TravelPackage::factory()->create(['start_date' => '2026-01-01']);
        $futurePackage = TravelPackage::factory()->create(['start_date' => '2027-01-01']);
        Booking::factory()->for($pastPackage, 'package')->create(['booking_code' => 'BK-OVERDUE']);
        Booking::factory()->for($futurePackage, 'package')->create(['booking_code' => 'BK-FUTURE']);

        $this->actingAs($user)
            ->get(route('financial.receivables.index', ['payment_status' => 'overdue']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('receivables.data', 1)
                ->where('receivables.data.0.booking_code', 'BK-OVERDUE')
                ->where('receivables.data.0.is_overdue', true));
    }

    public function test_vendor_hpp_workspace_separates_trip_summary_and_detail(): void
    {
        $user = $this->financeUser();
        $package = TravelPackage::factory()->create([
            'code' => 'TRIP-HPP',
            'currency' => 'IDR',
            'content' => [],
        ]);
        $ticket = TravelProduct::factory()->create([
            'name' => 'Tiket per Jemaah',
            'product_type' => 'tiket',
            'content' => ['price' => 100_000, 'currency' => 'IDR'],
        ]);
        $bus = TravelProduct::factory()->create([
            'name' => 'Bus Kolektif',
            'product_type' => 'transportasi',
            'content' => [
                'price' => 1_000_000,
                'currency' => 'IDR',
                'pricing_mode' => 'flat',
                'unit' => 'per paket',
            ],
        ]);
        $package->products()->sync([
            $ticket->id => ['sort_order' => 1, 'multiplier_per_pax' => 1],
            $bus->id => ['sort_order' => 2, 'multiplier_per_pax' => 1],
        ]);
        $package->update(['content' => [
            'hpp_estimate' => [
                'operational_costs' => [
                    'human_resources' => [[
                        'id' => 'admin-trip',
                        'name' => 'Admin Trip',
                        'salary' => 2_000_000,
                    ]],
                ],
            ],
            'hpp_currency_snapshots' => [
                'IDR' => ['currency' => 'IDR', 'rate_to_idr' => 1, 'source' => 'identity'],
            ],
        ]]);
        Booking::factory()->for($package, 'package')->create([
            'passenger_count' => 5,
            'room_configuration' => [],
            'status' => 'registered',
        ]);
        $vendor = PackageVendor::factory()->create(['name' => 'Vendor Hotel']);
        $account = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $bill = VendorBill::query()->create([
            'package_vendor_id' => $vendor->id,
            'package_id' => $package->id,
            'vendor_invoice_number' => 'INV-HOTEL-01',
            'bill_date' => '2026-10-01',
            'due_date' => '2026-10-30',
            'currency' => 'IDR',
            'amount_original' => 1_500_000,
            'amount_idr' => 1_500_000,
            'paid_amount_idr' => 500_000,
            'status' => 'partially_paid',
            'idempotency_key' => 'vendor-tracking-bill-001',
            'payload_hash' => hash('sha256', 'vendor-tracking-bill-001'),
        ]);
        VendorBillPayment::query()->create([
            'vendor_bill_id' => $bill->id,
            'amount_idr' => 500_000,
            'payment_date' => '2026-10-04',
            'financial_account_id' => $account->id,
            'idempotency_key' => 'vendor-tracking-payment-001',
            'payload_hash' => hash('sha256', 'vendor-tracking-payment-001'),
        ]);
        app(FinancialLedgerService::class)->postClassifiedCashTransaction([
            'transaction_type' => 'operating_expense',
            'financial_account_id' => $account->id,
            'package_id' => $package->id,
            'transaction_date' => '2026-10-04',
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 250_000,
            'amount_idr' => 250_000,
            'description' => 'Tip sopir trip',
            'idempotency_key' => 'trip-operating-expense-001',
        ]);

        $this->actingAs($user)
            ->get(route('financial.vendor-hpp.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('vendorHppSummary.registered_customers', 5)
                ->where('vendorHppSummary.actual_hpp_idr', 3_500_000)
                ->where('vendorHppSummary.billed_idr', 1_500_000)
                ->where('vendorHppSummary.paid_idr', 750_000)
                ->where('vendorHppSummary.vendor_payable_idr', 1_000_000)
                ->where('vendorHppSummary.operational_paid_idr', 250_000)
                ->where('vendorHppSummary.remaining_actual_hpp_idr', 2_750_000)
                ->where('tripFinanceRows', fn ($rows): bool => collect($rows)->contains(
                    fn (array $trip): bool => $trip['code'] === 'TRIP-HPP'
                        && $trip['registered_customers'] === 5
                        && $trip['actual_hpp_idr'] === 3_500_000
                        && $trip['billed_idr'] === 1_500_000
                        && $trip['vendor_payable_idr'] === 1_000_000
                        && ! array_key_exists('hpp_items', $trip)
                        && ! array_key_exists('bills', $trip),
                )));

        $this->actingAs($user)
            ->get(route('financial.vendor-hpp.show', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/Ledger/VendorHppShow')
                ->where('trip.code', 'TRIP-HPP')
                ->where('trip.actual_hpp_idr', 3_500_000)
                ->where('trip.hpp_items', fn ($items): bool => collect($items)->contains(
                    fn (array $item): bool => $item['label'] === 'Bus Kolektif'
                        && $item['calculation_basis'] === 'collective'
                        && $item['quantity'] === 1
                        && $item['total_price'] === 1_000_000,
                ))
                ->where('trip.operational_payments.0.account_label', '1002 · Bank Operasional')
                ->where('trip.operational_payments.0.description', 'Tip sopir trip')
                ->where('trip.bills.0.payments.0.account_label', '1002 · Bank Operasional'));
    }

    public function test_operational_hpp_payment_from_trip_detail_is_journaled_as_cash_out(): void
    {
        $user = $this->financeUser();
        $createPermission = Permission::query()->firstOrCreate([
            'name' => 'menu.financial_ledger.create',
            'guard_name' => 'web',
        ]);
        $user->givePermissionTo($createPermission);
        $package = TravelPackage::factory()->create(['code' => 'TRIP-BAYAR-HPP']);
        $account = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();

        $this->actingAs($user)
            ->post(route('financial.vendor-hpp.operational-payments.store', $package), [
                'transaction_type' => 'operating_expense',
                'financial_account_id' => $account->id,
                'package_id' => $package->id,
                'transaction_date' => '2026-10-04',
                'currency' => 'IDR',
                'exchange_rate' => 1,
                'amount_original' => 750_000,
                'amount_idr' => 750_000,
                'description' => 'Gaji muthawwif trip',
                'idempotency_key' => 'hpp-detail-payment-001',
            ])
            ->assertRedirect();

        $transaction = FinancialTransaction::query()
            ->where('idempotency_key', 'hpp-detail-payment-001')
            ->with('lines.account')
            ->firstOrFail();

        $this->assertSame('operating_expense', $transaction->transaction_type);
        $this->assertSame($package->id, $transaction->package_id);
        $this->assertTrue($transaction->lines->contains(
            fn ($line): bool => $line->entry_type === 'debit'
                && $line->account?->system_key === 'operating_expense'
                && $line->amount_idr === 750_000,
        ));
        $this->assertTrue($transaction->lines->contains(
            fn ($line): bool => $line->entry_type === 'credit'
                && $line->financial_account_id === $account->id
                && $line->amount_idr === 750_000,
        ));
    }

    private function financeUser(): User
    {
        $user = User::factory()->create();
        $permission = Permission::query()->firstOrCreate([
            'name' => 'menu.financial_ledger.view',
            'guard_name' => 'web',
        ]);
        $user->givePermissionTo($permission);

        return $user;
    }
}
