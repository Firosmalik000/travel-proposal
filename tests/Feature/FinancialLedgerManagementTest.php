<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Cashflow;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionType;
use App\Models\PackageVendor;
use App\Models\TravelPackage;
use App\Models\TripOperationalTransition;
use App\Models\User;
use App\Models\VendorAdvance;
use App\Models\VendorBill;
use App\Services\BookingPaymentLedgerService;
use App\Services\BookingPaymentService;
use App\Services\FinancialLedgerService;
use App\Services\TripClosingService;
use Closure;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class FinancialLedgerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(LogAdminActivityMiddleware::class);
    }

    public function test_it_protects_the_ledger_page_and_returns_important_inertia_props(): void
    {
        $this->get(route('financial-ledger.index'))->assertRedirect();
        $this->actingAs(User::factory()->create())->get(route('financial-ledger.index'))->assertForbidden();

        $this->actingAs($this->ledgerUser(['view']))
            ->get(route('financial-ledger.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/Ledger/Index')
                ->where('today', now()->toDateString())
                ->has('accounts', 19)
                ->has('transactionTypes')
                ->where('accounts.0.has_opening_balance', false)
                ->has('transactions.data')
                ->where('summary.cash_accounts', 4));
    }

    public function test_new_financial_workspaces_use_the_same_ledger_source(): void
    {
        $user = $this->ledgerUser(['view']);

        foreach ([
            'financial.transactions.index' => 'transactions',
            'financial.vendor-hpp.index' => 'vendor-hpp',
            'financial.accounting.index' => 'accounting',
            'financial.master.index' => 'master',
        ] as $routeName => $workspace) {
            $this->actingAs($user)
                ->get(route($routeName))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Dashboard/FinancialManagement/Ledger/Index')
                    ->where('workspace', $workspace)
                    ->has('accounts')
                    ->has('transactions.data'));
        }
    }

    public function test_accounting_user_can_open_transaction_detail_and_return_to_accounting(): void
    {
        $user = User::factory()->create();
        $permission = Permission::query()->firstOrCreate([
            'name' => 'menu.finance_accounting.view',
            'guard_name' => 'web',
        ]);
        $user->givePermissionTo($permission);
        $transaction = FinancialTransaction::factory()->create([
            'transaction_number' => 'TRX-DETAIL-ACCOUNTING',
        ]);

        $this->actingAs($user)
            ->get(route('financial.transactions.show', [
                'financialTransaction' => $transaction,
                'from' => 'accounting',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/Ledger/Show')
                ->where('permissionKey', 'finance_accounting')
                ->where('backUrl', '/admin/financial-management/accounting')
                ->where('backLabel', 'Pembukuan')
                ->where('detailContext', 'accounting')
                ->where('transaction.transaction_number', 'TRX-DETAIL-ACCOUNTING'));
    }

    public function test_authorized_admin_can_create_an_account_with_valid_cash_classification(): void
    {
        $user = $this->ledgerUser(['create']);
        $user->update(['username' => 'admin']);

        $this->actingAs($user)->post(route('financial-ledger.accounts.store'), [
            'code' => ' 1010 ',
            'name' => 'Bank Syariah Tambahan',
            'type' => 'asset',
            'is_cash_account' => true,
            'cash_account_type' => '',
            'currency' => 'idr',
            'is_active' => true,
        ])->assertSessionHasErrors('cash_account_type');

        $this->actingAs($user)->post(route('financial-ledger.accounts.store'), [
            'code' => '2010',
            'name' => 'Kas bertipe salah',
            'type' => 'liability',
            'is_cash_account' => true,
            'cash_account_type' => 'operating',
            'currency' => 'IDR',
            'is_active' => true,
        ])->assertSessionHasErrors('type');

        $this->actingAs($user)->post(route('financial-ledger.accounts.store'), [
            'code' => ' 1010 ',
            'name' => 'Bank Syariah Tambahan',
            'type' => 'asset',
            'is_cash_account' => true,
            'cash_account_type' => 'operating',
            'account_number' => '1234567890',
            'currency' => 'idr',
            'is_active' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('financial_accounts', [
            'code' => '1010',
            'currency' => 'IDR',
            'cash_account_type' => 'operating',
        ]);
    }

    public function test_super_admin_can_manage_custom_transaction_types_without_deleting_used_history(): void
    {
        $user = $this->ledgerUser(['view', 'create', 'edit', 'delete']);
        $user->update(['username' => 'admin']);

        $this->actingAs($user)->post(route('financial-ledger.transaction-types.store'), [
            'code' => '',
            'name' => 'Transfer Dana Proyek',
            'applies_to' => 'transfer',
            'description' => 'Contoh jenis transaksi custom.',
            'is_active' => true,
            'sort_order' => 25,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $type = FinancialTransactionType::query()->where('code', 'transfer_dana_proyek')->firstOrFail();
        $this->assertFalse($type->is_system);

        $this->actingAs($user)->put(route('financial-ledger.transaction-types.update', $type), [
            'name' => 'Transfer Dana Proyek Khusus',
            'applies_to' => 'transfer',
            'description' => 'Nama diperbarui.',
            'is_active' => false,
            'sort_order' => 26,
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('financial_transaction_types', [
            'id' => $type->id,
            'name' => 'Transfer Dana Proyek Khusus',
            'is_active' => false,
        ]);

        FinancialTransaction::factory()->create(['category_code' => $type->code]);
        $this->actingAs($user)
            ->delete(route('financial-ledger.transaction-types.destroy', $type))
            ->assertSessionHasErrors('transaction_type');
        $this->assertDatabaseHas('financial_transaction_types', ['id' => $type->id]);

        $unused = FinancialTransactionType::query()->create([
            'code' => 'unused_transfer_type',
            'name' => 'Jenis Belum Dipakai',
            'applies_to' => 'transfer',
            'is_active' => true,
            'is_system' => false,
            'sort_order' => 99,
        ]);
        $this->actingAs($user)
            ->delete(route('financial-ledger.transaction-types.destroy', $unused))
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('financial_transaction_types', ['id' => $unused->id]);
    }

    public function test_non_super_admin_cannot_manage_chart_of_accounts_or_opening_balances(): void
    {
        $user = $this->ledgerUser(['create', 'edit']);
        $account = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();

        $this->actingAs($user)->post(route('financial-ledger.accounts.store'), [
            'code' => '1010',
            'name' => 'Bank Tidak Diizinkan',
            'type' => 'asset',
            'is_cash_account' => true,
            'cash_account_type' => 'operating',
            'currency' => 'IDR',
            'is_active' => true,
        ])->assertForbidden();

        $this->actingAs($user)->post(route('financial-ledger.opening-balances.store'), [
            'financial_account_id' => $account->id,
            'transaction_date' => '2026-09-01',
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 1_000_000,
            'amount_idr' => 1_000_000,
            'description' => 'Tidak diizinkan',
            'idempotency_key' => 'forbidden-opening-balance',
        ])->assertForbidden();

        $this->assertDatabaseMissing('financial_accounts', ['code' => '1010']);
        $this->assertDatabaseCount('financial_transactions', 0);
    }

    public function test_ledger_ui_exposes_financial_inputs_as_focused_dialog_actions(): void
    {
        $source = file_get_contents(resource_path('js/pages/Dashboard/FinancialManagement/Ledger/Index.tsx'))
            .file_get_contents(resource_path('js/pages/Dashboard/FinancialManagement/Ledger/MasterAccountsSection.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('Catat saldo awal', $source);
        $this->assertStringContainsString('Buat jurnal', $source);
        $this->assertStringContainsString('Jenis perpindahan dana', $source);
        $this->assertStringContainsString('Pilih jenis perpindahan', $source);
        $this->assertStringNotContainsString('Kategori / tujuan transaksi', $source);
        $this->assertStringContainsString('<DialogContent', $source);
        $this->assertStringContainsString("'Nominal transaksi (IDR)'", $source);
        $this->assertStringContainsString('Contoh: 1000000', $source);
        $this->assertStringContainsString('MoreHorizontal', $source);
        $this->assertStringContainsString('{index + 1}', $source);
        $this->assertStringContainsString('!account.has_opening_balance', $source);
        $this->assertStringNotContainsString('Masukkan angka tanpa tanda titik atau koma', $source);
        $this->assertStringNotContainsString('value="posting"', $source);
    }

    public function test_only_manual_source_transactions_are_exposed_as_reversible(): void
    {
        $user = $this->ledgerUser(['view', 'edit']);
        $this->actingAs($user);
        $bank = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $expense = FinancialAccount::query()->where('system_key', 'operating_expense')->firstOrFail();
        $customerFunds = FinancialAccount::query()->where('system_key', 'customer_funds')->firstOrFail();
        $customerAdvance = FinancialAccount::query()->where('system_key', 'customer_advance')->firstOrFail();
        $ledger = app(FinancialLedgerService::class);

        $manual = $ledger->postTwoSidedJournal([
            'transaction_date' => '2026-09-01',
            'transaction_type' => 'manual_journal',
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'debit_account_id' => $expense->id,
            'credit_account_id' => $bank->id,
            'amount_original' => 100_000,
            'amount_idr' => 100_000,
            'description' => 'Jurnal manual',
            'idempotency_key' => 'manual-reversal-visibility-test',
        ]);
        $sourced = $ledger->post([
            'transaction_date' => '2026-09-01',
            'transaction_type' => 'booking_payment',
            'source_type' => BookingPayment::class,
            'source_id' => 999_999,
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'idempotency_key' => 'source-reversal-visibility-test',
            'description' => 'Transaksi dari modul booking',
        ], [
            [
                'financial_account_id' => $customerFunds->id,
                'entry_type' => 'debit',
                'amount_original' => 100_000,
                'amount_idr' => 100_000,
                'description' => 'Pembayaran booking',
            ],
            [
                'financial_account_id' => $customerAdvance->id,
                'entry_type' => 'credit',
                'amount_original' => 100_000,
                'amount_idr' => 100_000,
                'description' => 'Pembayaran booking',
            ],
        ]);

        $this->get(route('financial-ledger.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where(
                'transactions.data',
                fn ($transactions): bool => collect($transactions)->contains(
                    fn (array $transaction): bool => $transaction['id'] === $manual->id
                        && $transaction['can_reverse'] === true,
                ) && collect($transactions)->contains(
                    fn (array $transaction): bool => $transaction['id'] === $sourced->id
                        && $transaction['can_reverse'] === false,
                ),
            ));
    }

    public function test_it_posts_one_balanced_opening_balance_and_rejects_a_duplicate(): void
    {
        $user = $this->ledgerUser(['create', 'view']);
        $user->update(['username' => 'admin']);
        $account = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $payload = [
            'financial_account_id' => $account->id,
            'transaction_date' => '2026-09-01',
            'currency' => 'IDR',
            'exchange_rate' => '1.00000000',
            'amount_original' => '15000000.0000',
            'amount_idr' => 15_000_000,
            'description' => 'Saldo rekening per cut-off',
            'idempotency_key' => 'opening-test-001',
        ];

        $this->actingAs($user)
            ->post(route('financial-ledger.opening-balances.store'), $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $transaction = FinancialTransaction::query()->with('lines')->sole();
        $this->assertSame('posted', $transaction->status);
        $this->assertSame('opening_balance', $transaction->transaction_type);
        $this->assertCount(2, $transaction->lines);
        $this->assertSame(15_000_000, $transaction->lines->where('entry_type', 'debit')->sum('amount_idr'));
        $this->assertSame(15_000_000, $transaction->lines->where('entry_type', 'credit')->sum('amount_idr'));
        $this->assertSame('opening_balance:'.$account->id, $transaction->idempotency_key);

        $this->actingAs($user)
            ->get(route('financial-ledger.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('accounts', fn ($accounts): bool => collect($accounts)->contains(
                    fn (array $listedAccount): bool => $listedAccount['id'] === $account->id
                        && $listedAccount['has_opening_balance'] === true,
                )));

        $payload['idempotency_key'] = 'opening-test-002';
        $this->actingAs($user)
            ->post(route('financial-ledger.opening-balances.store'), $payload)
            ->assertSessionHasNoErrors();

        $payload['amount_original'] = '16000000.0000';
        $payload['amount_idr'] = 16_000_000;
        $this->actingAs($user)
            ->post(route('financial-ledger.opening-balances.store'), $payload)
            ->assertSessionHasErrors('ledger');

        $this->assertDatabaseCount('financial_transactions', 1);
    }

    public function test_vendor_bill_and_payment_are_idempotent_and_update_status(): void
    {
        $user = $this->ledgerUser(['create', 'view']);
        $vendor = PackageVendor::query()->create(['name' => 'Vendor Test', 'phone' => '08120000000']);
        $package = TravelPackage::factory()->create();
        $billPayload = [
            'package_vendor_id' => $vendor->id, 'package_id' => $package->id, 'bill_date' => '2026-09-19', 'due_date' => '2026-09-30',
            'amount_idr' => 1_000_000, 'notes' => 'Tagihan vendor test', 'idempotency_key' => 'vendor-bill-test-001',
        ];
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.store'), $billPayload)->assertRedirect()->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.store'), $billPayload)->assertRedirect()->assertSessionHasNoErrors();
        $bill = VendorBill::query()->where('idempotency_key', $billPayload['idempotency_key'])->firstOrFail();
        $this->assertSame('vendor_service_pending', $bill->postedTransaction->lines()->where('entry_type', 'debit')->firstOrFail()->account->system_key);
        $cash = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $payment = ['amount_idr' => 1_000_000, 'payment_date' => '2026-09-19', 'financial_account_id' => $cash->id, 'notes' => 'Bayar vendor test', 'idempotency_key' => 'vendor-payment-test-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.payments.store', $bill), $payment)->assertRedirect()->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.payments.store', $bill), $payment)->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('vendor_bills', ['id' => $bill->id, 'status' => 'paid', 'paid_amount_idr' => 1_000_000]);
        $this->assertSame(1, VendorBill::query()->where('idempotency_key', $billPayload['idempotency_key'])->count());
        $this->assertSame(1, $bill->payments()->where('idempotency_key', $payment['idempotency_key'])->count());
        $this->assertSame(1, FinancialTransaction::query()->where('transaction_type', 'vendor_bill')->count());
        $this->assertSame(1, FinancialTransaction::query()->where('transaction_type', 'vendor_payment')->count());
        $this->artisan('finance:audit-vendors')->assertSuccessful();
    }

    public function test_vendor_advance_can_be_paid_and_applied_to_bill_idempotently(): void
    {
        $user = $this->ledgerUser(['create', 'view']);
        $vendor = PackageVendor::query()->create(['name' => 'Vendor Advance', 'phone' => '08120000001']);
        $package = TravelPackage::factory()->create();
        $cash = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $advancePayload = ['package_vendor_id' => $vendor->id, 'amount_idr' => 500_000, 'advance_date' => '2026-09-19', 'financial_account_id' => $cash->id, 'notes' => 'DP vendor', 'idempotency_key' => 'vendor-advance-test-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.store'), $advancePayload)->assertRedirect()->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.store'), $advancePayload)->assertRedirect()->assertSessionHasNoErrors();
        $advance = VendorAdvance::query()->where('idempotency_key', $advancePayload['idempotency_key'])->firstOrFail();
        $billPayload = ['package_vendor_id' => $vendor->id, 'package_id' => $package->id, 'bill_date' => '2026-09-19', 'amount_idr' => 1_000_000, 'notes' => 'Tagihan vendor', 'idempotency_key' => 'vendor-bill-advance-test-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.store'), $billPayload)->assertRedirect()->assertSessionHasNoErrors();
        $bill = VendorBill::query()->where('idempotency_key', $billPayload['idempotency_key'])->firstOrFail();
        $allocation = ['amount_idr' => 500_000, 'allocation_date' => '2026-09-19', 'notes' => 'Potong DP vendor', 'idempotency_key' => 'vendor-advance-application-test-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.apply', [$advance, $bill]), $allocation)->assertRedirect()->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.apply', [$advance, $bill]), $allocation)->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('vendor_advances', ['id' => $advance->id, 'status' => 'applied', 'applied_amount_idr' => 500_000]);
        $this->assertDatabaseHas('vendor_bills', ['id' => $bill->id, 'status' => 'partially_paid', 'paid_amount_idr' => 500_000]);
        $this->assertSame(1, $advance->allocations()->where('idempotency_key', $allocation['idempotency_key'])->count());
        $this->artisan('finance:audit-vendors')->assertSuccessful();
    }

    public function test_vendor_cost_is_recognized_only_when_service_is_used_and_cannot_exceed_bill(): void
    {
        $user = $this->ledgerUser(['create', 'view']);
        $vendor = PackageVendor::query()->create(['name' => 'Vendor Layanan', 'phone' => '08120000002']);
        $package = TravelPackage::factory()->create();
        $payload = ['package_vendor_id' => $vendor->id, 'package_id' => $package->id, 'bill_date' => '2026-09-19', 'amount_idr' => 1_000_000, 'notes' => 'Hotel', 'idempotency_key' => 'bill-use-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.store'), $payload)->assertSessionHasNoErrors();
        $bill = VendorBill::query()->where('idempotency_key', 'bill-use-001')->firstOrFail();
        $this->assertSame(0, FinancialTransaction::query()->where('transaction_type', 'vendor_service_use')->count());
        $usage = ['amount_idr' => 400_000, 'usage_date' => '2026-09-19', 'notes' => 'Malam pertama', 'idempotency_key' => 'use-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.service-usages.store', $bill), $usage)->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.service-usages.store', $bill), $usage)->assertSessionHasNoErrors();
        $this->assertSame(1, FinancialTransaction::query()->where('transaction_type', 'vendor_service_use')->count());
        $this->assertSame('trip_cost', $bill->serviceUsages()->firstOrFail()->transaction->lines()->where('entry_type', 'debit')->firstOrFail()->account->system_key);
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.service-usages.store', $bill), [...$usage, 'amount_idr' => 700_000, 'idempotency_key' => 'use-002'])->assertSessionHasErrors('vendor');
        $this->assertSame(400_000, (int) $bill->serviceUsages()->sum('amount_idr'));
        $this->artisan('finance:audit-vendors')->assertSuccessful();
    }

    public function test_vendor_documents_require_identity_and_cross_vendor_advance_is_rejected(): void
    {
        $user = $this->ledgerUser(['create']);
        $package = TravelPackage::factory()->create();
        $vendorA = PackageVendor::query()->create(['name' => 'Vendor A', 'phone' => '08120000003']);
        $vendorB = PackageVendor::query()->create(['name' => 'Vendor B', 'phone' => '08120000004']);
        $cash = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $billPayload = ['package_vendor_id' => $vendorB->id, 'package_id' => $package->id, 'bill_date' => '2026-09-19', 'amount_idr' => 500_000, 'notes' => 'Tagihan', 'idempotency_key' => 'cross-bill-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.store'), [...$billPayload, 'package_id' => null])->assertSessionHasErrors('package_id');
        $this->actingAs($user)->post(route('financial-ledger.vendor-bills.store'), $billPayload)->assertSessionHasNoErrors();
        $advancePayload = ['package_vendor_id' => $vendorA->id, 'amount_idr' => 500_000, 'advance_date' => '2026-09-19', 'financial_account_id' => $cash->id, 'notes' => 'DP', 'idempotency_key' => 'cross-advance-001'];
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.store'), [...$advancePayload, 'package_vendor_id' => null])->assertSessionHasErrors('package_vendor_id');
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.store'), $advancePayload)->assertSessionHasNoErrors();
        $bill = VendorBill::query()->where('idempotency_key', 'cross-bill-001')->firstOrFail();
        $advance = VendorAdvance::query()->where('idempotency_key', 'cross-advance-001')->firstOrFail();
        $this->actingAs($user)->post(route('financial-ledger.vendor-advances.apply', [$advance, $bill]), ['amount_idr' => 100_000, 'allocation_date' => '2026-09-19', 'notes' => 'Salah vendor', 'idempotency_key' => 'cross-apply-001'])->assertSessionHasErrors('vendor');
        $this->assertSame(0, (int) $bill->fresh()->paid_amount_idr);
    }

    public function test_trip_status_must_advance_in_order_and_transition_retry_is_idempotent(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => '2026-09-01', 'end_date' => '2026-09-10', 'operational_status' => 'planning',
        ]);
        $service = app(TripClosingService::class);
        $this->assertDomainException(fn () => $service->transition($package, ['to_status' => 'returned', 'occurred_date' => '2026-09-10', 'notes' => 'Trip kembali', 'idempotency_key' => 'trip-skip-001']), 'berurutan');
        $data = ['to_status' => 'ready', 'occurred_date' => '2026-08-31', 'notes' => 'Seluruh persiapan selesai', 'idempotency_key' => 'trip-ready-001'];
        $first = $service->transition($package, $data);
        $retry = $service->transition($package->fresh(), $data);
        $this->assertSame($first->id, $retry->id);
        $this->assertSame('ready', $package->fresh()->operational_status);
        $this->assertSame(1, TripOperationalTransition::query()->count());
    }

    public function test_financial_close_recognizes_paid_booking_revenue_once_and_supports_official_reversal(): void
    {
        $user = $this->ledgerUser(['view', 'edit', 'approve']);
        $this->actingAs($user);
        $package = TravelPackage::factory()->create([
            'start_date' => '2026-09-01', 'end_date' => '2026-09-10', 'operational_status' => 'returned',
        ]);
        $booking = Booking::factory()->for($package, 'package')->create(['agreed_total_amount' => 1_000_000, 'status' => 'registered']);
        $cash = FinancialAccount::query()->where('system_key', 'customer_funds')->firstOrFail();
        $payment = BookingPayment::query()->create([
            'booking_id' => $booking->id, 'payment_date' => '2026-09-05', 'amount' => 1_000_000,
            'currency' => 'IDR', 'exchange_rate' => 1, 'amount_idr' => 1_000_000,
            'financial_account_id' => $cash->id, 'payment_method' => 'transfer', 'status' => 'confirmed',
            'idempotency_key' => 'trip-payment-001',
        ]);
        app(BookingPaymentLedgerService::class)->sync($booking, $payment);
        $service = app(TripClosingService::class);
        $data = ['to_status' => 'financially_closed', 'occurred_date' => '2026-09-19', 'notes' => 'Finance menyetujui penutupan', 'idempotency_key' => 'trip-close-001'];
        $closure = $service->transition($package, $data);
        $retry = $service->transition($package->fresh(), $data);
        $this->assertSame($closure->id, $retry->id);
        $this->assertSame('financially_closed', $package->fresh()->operational_status);
        $this->assertSame(1_000_000, $closure->revenue_amount_idr);
        $transaction = FinancialTransaction::query()->where('transaction_type', 'trip_revenue_recognition')->firstOrFail();
        $this->assertSame(['customer_advance', 'trip_revenue'], $transaction->lines()->with('account')->get()->pluck('account.system_key')->sort()->values()->all());
        $this->assertDomainException(fn () => app(BookingPaymentService::class)->void($booking, $payment), 'ditutup secara finansial');
        $this->artisan('finance:audit-trips')->assertSuccessful();

        $service->reverseClosure($package->fresh(), 'Koreksi penutupan trip');
        $this->assertSame('returned', $package->fresh()->operational_status);
        $this->assertSame('reversed', $transaction->fresh()->status);
        $this->assertNotNull($closure->fresh()->reversed_at);
        $this->artisan('finance:audit-trips')->assertSuccessful();
    }

    public function test_trip_close_is_blocked_when_booking_is_unpaid(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => '2026-09-01', 'end_date' => '2026-09-10', 'operational_status' => 'returned',
        ]);
        Booking::factory()->for($package, 'package')->create(['agreed_total_amount' => 1_000_000, 'status' => 'registered']);
        $this->assertDomainException(fn () => app(TripClosingService::class)->transition($package, ['to_status' => 'financially_closed', 'occurred_date' => '2026-09-19', 'notes' => 'Finance mencoba menutup', 'idempotency_key' => 'trip-close-blocked-001']), 'belum lunas');
        $this->assertSame('returned', $package->fresh()->operational_status);
        $this->assertDatabaseCount('trip_operational_transitions', 0);
    }

    public function test_trip_transition_routes_enforce_edit_and_finance_approval_permissions(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => '2026-09-01', 'end_date' => '2026-09-10', 'operational_status' => 'planning',
        ]);
        $payload = ['to_status' => 'ready', 'occurred_date' => '2026-08-31', 'notes' => 'Persiapan trip selesai', 'idempotency_key' => 'trip-auth-ready-001'];
        $this->actingAs($this->ledgerUser(['view']))->post(route('financial-ledger.trips.transitions.store', $package), $payload)->assertForbidden();
        $editor = $this->ledgerUser(['edit']);
        $this->actingAs($editor)->post(route('financial-ledger.trips.transitions.store', $package), $payload)->assertRedirect()->assertSessionHasNoErrors();

        $package->forceFill(['operational_status' => 'returned'])->saveQuietly();
        $this->actingAs($editor)->post(route('financial-ledger.trips.transitions.store', $package), [...$payload, 'to_status' => 'financially_closed', 'idempotency_key' => 'trip-auth-close-001'])->assertForbidden();
    }

    public function test_it_enforces_balanced_journals_and_idempotent_retry_semantics(): void
    {
        $service = app(FinancialLedgerService::class);
        $debit = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $debit->update(['currency' => 'USD']);
        $credit = FinancialAccount::query()->where('system_key', 'owner_equity')->firstOrFail();
        $header = [
            'transaction_date' => '2026-09-01',
            'transaction_type' => 'manual_journal',
            'currency' => 'USD',
            'exchange_rate' => '16500.00000000',
            'idempotency_key' => 'journal-test-001',
            'description' => 'Setoran modal USD',
        ];
        $lines = [
            ['financial_account_id' => $debit->id, 'entry_type' => 'debit', 'amount_original' => '100.0000', 'amount_idr' => 1_650_000],
            ['financial_account_id' => $credit->id, 'entry_type' => 'credit', 'amount_original' => '100.0000', 'amount_idr' => 1_650_000],
        ];

        $first = $service->post($header, $lines);
        $retry = $service->post($header, $lines);

        $this->assertSame($first->id, $retry->id);
        $this->assertSame(1, FinancialTransaction::query()->count());
        $this->assertSame('USD', $first->currency);
        $this->assertSame('16500.00000000', $first->exchange_rate);

        $changedLines = $lines;
        $changedLines[1]['amount_idr'] = 1_600_000;
        $this->assertDomainException(
            fn () => $service->post($header, $changedLines),
            'Jurnal tidak seimbang',
        );

        $changedLines[0]['amount_idr'] = 1_600_000;
        $this->assertDomainException(
            fn () => $service->post($header, $changedLines),
            'Idempotency key',
        );
    }

    public function test_transfers_stay_outside_profit_accounts_and_reversal_preserves_history(): void
    {
        $user = $this->ledgerUser(['create', 'edit', 'view']);
        $operating = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $pettyCash = FinancialAccount::query()->where('system_key', 'petty_cash')->firstOrFail();
        $this->actingAs($user);

        app(FinancialLedgerService::class)->postOpeningBalance($operating, [
            'transaction_date' => '2026-09-01',
            'currency' => 'IDR',
            'exchange_rate' => '1.00000000',
            'amount_original' => '1000000.0000',
            'amount_idr' => 1_000_000,
            'description' => 'Saldo awal untuk pengujian transfer',
        ]);

        $this->post(route('financial-ledger.journals.store'), [
            'transaction_date' => '2026-09-07',
            'transaction_type' => 'transfer',
            'category_code' => 'petty_cash_replenishment',
            'debit_account_id' => $pettyCash->id,
            'credit_account_id' => $operating->id,
            'currency' => 'IDR',
            'exchange_rate' => '1.00000000',
            'amount_original' => '1500000.0000',
            'amount_idr' => 1_500_000,
            'description' => 'Transfer melebihi saldo',
            'idempotency_key' => 'transfer-test-insufficient',
        ])->assertSessionHasErrors('ledger');
        $this->assertDatabaseCount('financial_transactions', 1);

        $this->post(route('financial-ledger.journals.store'), [
            'transaction_date' => '2026-09-07',
            'transaction_type' => 'transfer',
            'category_code' => 'petty_cash_replenishment',
            'debit_account_id' => $pettyCash->id,
            'credit_account_id' => $operating->id,
            'currency' => 'IDR',
            'exchange_rate' => '1.00000000',
            'amount_original' => '500000.0000',
            'amount_idr' => 500_000,
            'description' => 'Isi kas kecil',
            'idempotency_key' => 'transfer-test-001',
        ])->assertSessionHasNoErrors();

        $transaction = FinancialTransaction::query()
            ->where('transaction_type', 'transfer')
            ->with('lines.account')
            ->sole();
        $this->assertSame(['asset'], $transaction->lines->pluck('account.type')->unique()->all());
        $this->assertSame('petty_cash_replenishment', $transaction->category_code);

        $this->post(route('financial-ledger.journals.store'), [
            'transaction_date' => '2026-09-07',
            'transaction_type' => 'transfer',
            'category_code' => 'petty_cash_replenishment',
            'debit_account_id' => FinancialAccount::query()->where('system_key', 'operating_expense')->value('id'),
            'credit_account_id' => $operating->id,
            'currency' => 'IDR',
            'exchange_rate' => '1.00000000',
            'amount_original' => '100000.0000',
            'amount_idr' => 100_000,
            'description' => 'Transfer tidak valid',
            'idempotency_key' => 'transfer-test-invalid',
        ])->assertSessionHasErrors('ledger');
        $this->assertDatabaseCount('financial_transactions', 2);

        $this->actingAs($user)->post(route('financial-ledger.transactions.reverse', $transaction), [
            'reason' => 'Transfer dicatat pada tanggal yang salah',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $transaction->refresh();
        $reversal = FinancialTransaction::query()->where('reversal_of_id', $transaction->id)->firstOrFail();
        $this->assertSame('reversed', $transaction->status);
        $this->assertSame('reversal', $reversal->transaction_type);
        $this->assertSame('petty_cash_replenishment', $reversal->category_code);
        $this->assertSame(3, FinancialTransaction::query()->count());

        $this->assertDomainException(
            fn () => $transaction->update(['description' => 'diubah']),
            'bersifat tetap',
        );
        $this->assertDomainException(
            fn () => $transaction->delete(),
            'tidak dapat dihapus',
        );
        $this->assertDomainException(
            fn () => $transaction->lines()->create([
                'financial_account_id' => $operating->id,
                'entry_type' => 'debit',
                'amount_original' => 1,
                'amount_idr' => 1,
            ]),
            'Baris transaksi posted',
        );

        $this->get(route('financial-ledger.index', ['category_code' => 'petty_cash_replenishment']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.category_code', 'petty_cash_replenishment')
                ->where('transactions.data.0.category_label', 'Pengisian kas kecil')
                ->where('summary.cash_balance_idr', 1_000_000));

        $this->artisan('finance:audit-ledger')
            ->expectsOutputToContain('Ledger seimbang dan konsisten')
            ->assertSuccessful();
    }

    public function test_database_guard_rejects_direct_mutation_of_a_posted_transaction(): void
    {
        $this->actingAs(User::factory()->create());
        $accounts = FinancialAccount::query()->whereIn('system_key', ['operating_bank', 'operating_expense'])->get()->keyBy('system_key');
        $transaction = app(FinancialLedgerService::class)->postTwoSidedJournal([
            'transaction_date' => '2026-09-07',
            'transaction_type' => 'manual_journal',
            'debit_account_id' => $accounts['operating_expense']->id,
            'credit_account_id' => $accounts['operating_bank']->id,
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 100_000,
            'amount_idr' => 100_000,
            'description' => 'Uji pengaman database',
            'idempotency_key' => 'database-immutability-test',
        ]);

        $this->expectException(QueryException::class);
        DB::table('financial_transactions')->whereKey($transaction->id)->update(['amount_idr' => 1]);
    }

    public function test_classified_cash_posts_to_equity_or_expense_without_using_customer_funds(): void
    {
        $user = $this->ledgerUser(['create']);
        $bank = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $customerFunds = FinancialAccount::query()->where('system_key', 'customer_funds')->firstOrFail();
        $payload = [
            'transaction_type' => 'capital_contribution',
            'financial_account_id' => $bank->id,
            'transaction_date' => '2026-09-19',
            'currency' => 'IDR',
            'exchange_rate' => '1',
            'amount_original' => '1000000',
            'amount_idr' => 1000000,
            'description' => 'Setoran modal pemilik',
            'idempotency_key' => 'phase3-capital-001',
        ];

        $this->actingAs($user)->post(route('financial-ledger.cash-transactions.store'), $payload)
            ->assertSessionHasNoErrors();
        $this->actingAs($user)->post(route('financial-ledger.cash-transactions.store'), $payload)
            ->assertSessionHasNoErrors();
        $this->assertDatabaseCount('financial_transactions', 1);
        $this->assertSame(['asset', 'equity'], FinancialTransaction::query()->firstOrFail()->lines()->with('account')->get()->pluck('account.type')->sort()->values()->all());

        $this->actingAs($user)->post(route('financial-ledger.cash-transactions.store'), [
            ...$payload,
            'transaction_type' => 'other_income',
            'description' => 'Pendapatan administrasi',
            'idempotency_key' => 'phase3-other-income-001',
        ])->assertSessionHasNoErrors();
        $this->assertSame(
            ['asset', 'revenue'],
            FinancialTransaction::query()
                ->where('transaction_type', 'other_income')
                ->firstOrFail()
                ->lines()
                ->with('account')
                ->get()
                ->pluck('account.type')
                ->sort()
                ->values()
                ->all(),
        );

        $this->actingAs($user)->post(route('financial-ledger.cash-transactions.store'), [
            ...$payload,
            'transaction_type' => 'operating_expense',
            'financial_account_id' => $customerFunds->id,
            'idempotency_key' => 'phase3-opex-invalid',
        ])->assertSessionHasErrors('ledger');

        $this->actingAs($user)->post(route('financial-ledger.cash-transactions.store'), [
            ...$payload,
            'transaction_type' => 'owner_withdrawal',
            'idempotency_key' => 'phase3-withdrawal-001',
        ])->assertSessionHasNoErrors();
        $this->assertSame(['asset', 'equity'], FinancialTransaction::query()->where('transaction_type', 'owner_withdrawal')->firstOrFail()->lines()->with('account')->get()->pluck('account.type')->sort()->values()->all());
    }

    public function test_refund_is_limited_by_the_confirmed_payment_and_can_be_reversed_from_its_source(): void
    {
        $this->actingAs($this->ledgerUser(['create']));
        $booking = Booking::factory()->create(['agreed_total_amount' => 2000000, 'agreed_currency' => 'IDR']);
        $customerFunds = FinancialAccount::query()->where('system_key', 'customer_funds')->firstOrFail();
        $payment = app(BookingPaymentService::class)->create($booking, [
            'payment_date' => '2026-09-19',
            'amount' => 1000000,
            'currency' => 'IDR',
            'exchange_rate' => '1',
            'financial_account_id' => $customerFunds->id,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
            'attachment_override_reason' => 'Pemeriksaan otomatis tanpa bukti unggah.',
            'idempotency_key' => 'phase3-payment-001',
        ]);

        $payload = [
            'transaction_type' => 'customer_refund',
            'financial_account_id' => $customerFunds->id,
            'booking_payment_id' => $payment->id,
            'transaction_date' => '2026-09-19',
            'currency' => 'IDR',
            'exchange_rate' => '1',
            'amount_original' => 250000,
            'amount_idr' => 250000,
            'description' => 'Pengembalian sebagian',
            'idempotency_key' => 'phase3-refund-001',
        ];
        $ledger = app(FinancialLedgerService::class);
        $refund = $ledger->postClassifiedCashTransaction($payload);
        $this->assertSame($refund->id, $ledger->postClassifiedCashTransaction($payload)->id);
        $this->assertSame('customer_refund', $refund->transaction_type);
        $this->assertSame(250000, (int) $refund->lines()->where('entry_type', 'credit')->sum('amount_idr'));
        $this->assertSame(750000, app(BookingPaymentService::class)->summary($booking)['paid_amount']);

        $this->assertDomainException(fn () => $ledger->postClassifiedCashTransaction([
            ...$payload,
            'amount_original' => 800000,
            'amount_idr' => 800000,
            'idempotency_key' => 'phase3-refund-overflow',
        ]), 'melebihi');

        $ledger->reverse($refund, 'Refund salah nominal');
        $this->assertSame('reversed', $refund->fresh()->status);
        $this->assertSame(1000000, app(BookingPaymentService::class)->summary($booking)['paid_amount']);
    }

    public function test_legacy_cashflow_backfill_previews_and_executes_idempotently(): void
    {
        Cashflow::factory()->create([
            'transaction_date' => '2026-08-31',
            'type' => 'expense',
            'amount' => 750_000,
            'category' => 'Operasional',
            'description' => 'Biaya sebelum cut-off',
        ]);
        Cashflow::factory()->create([
            'transaction_date' => '2026-08-31',
            'type' => 'income',
            'amount' => 2_000_000,
            'category' => 'booking_payment',
        ]);

        $this->artisan('finance:backfill-legacy-cashflows')
            ->expectsOutputToContain('Mode preview')
            ->assertSuccessful();
        $this->assertDatabaseCount('financial_transactions', 0);

        $this->artisan('finance:backfill-legacy-cashflows --commit')
            ->expectsOutputToContain('1 cashflow')
            ->assertSuccessful();
        $this->assertDatabaseCount('financial_transactions', 1);
        $this->assertDatabaseHas('financial_transactions', [
            'transaction_type' => 'operating_expense',
            'amount_idr' => 750_000,
        ]);

        $this->artisan('finance:backfill-legacy-cashflows --commit')
            ->expectsOutputToContain('0 cashflow')
            ->assertSuccessful();
        $this->assertDatabaseCount('financial_transactions', 1);
    }

    /**
     * @param  array<int, string>  $actions
     */
    private function ledgerUser(array $actions): User
    {
        $user = User::factory()->create();

        foreach ($actions as $action) {
            $permission = Permission::query()->firstOrCreate([
                'name' => 'menu.financial_ledger.'.$action,
                'guard_name' => 'web',
            ]);
            $user->givePermissionTo($permission);
        }

        return $user;
    }

    private function assertDomainException(Closure $callback, string $message): void
    {
        try {
            $callback();
            $this->fail('DomainException yang diharapkan tidak dilempar.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString($message, $exception->getMessage());
        }
    }
}
