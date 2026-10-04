<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_transaction_types', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 60)->unique();
            $table->string('name', 120);
            $table->enum('applies_to', ['transfer', 'manual_journal', 'system']);
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['applies_to', 'is_active', 'sort_order'], 'financial_transaction_types_selector_idx');
        });

        $now = now();
        DB::table('financial_transaction_types')->insert([
            ['code' => 'opening_balance', 'name' => 'Saldo awal', 'applies_to' => 'system', 'description' => 'Jenis bawaan untuk pembentukan saldo awal akun.', 'is_active' => true, 'is_system' => true, 'sort_order' => 10, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'operational_funding', 'name' => 'Pendanaan operasional', 'applies_to' => 'transfer', 'description' => 'Pemindahan dana untuk kebutuhan rekening operasional.', 'is_active' => true, 'is_system' => false, 'sort_order' => 20, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'petty_cash_replenishment', 'name' => 'Pengisian kas kecil', 'applies_to' => 'transfer', 'description' => 'Pengisian atau penambahan saldo kas kecil.', 'is_active' => true, 'is_system' => false, 'sort_order' => 30, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'customer_fund_transfer', 'name' => 'Pemindahan dana jemaah', 'applies_to' => 'transfer', 'description' => 'Pemindahan dana antar-rekening penampungan jemaah.', 'is_active' => true, 'is_system' => false, 'sort_order' => 40, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'reserve_allocation', 'name' => 'Alokasi dana cadangan', 'applies_to' => 'transfer', 'description' => 'Pemindahan dana ke atau dari rekening cadangan.', 'is_active' => true, 'is_system' => false, 'sort_order' => 50, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'inter_account_transfer', 'name' => 'Transfer antar-rekening lainnya', 'applies_to' => 'transfer', 'description' => 'Jenis bawaan untuk transfer internal yang belum memiliki klasifikasi khusus.', 'is_active' => true, 'is_system' => true, 'sort_order' => 60, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'reclassification', 'name' => 'Reklasifikasi akun', 'applies_to' => 'manual_journal', 'description' => 'Pemindahan klasifikasi saldo antar-akun.', 'is_active' => true, 'is_system' => false, 'sort_order' => 70, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'recording_correction', 'name' => 'Koreksi pencatatan', 'applies_to' => 'manual_journal', 'description' => 'Koreksi pencatatan tanpa menghapus histori.', 'is_active' => true, 'is_system' => false, 'sort_order' => 80, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'accrual_adjustment', 'name' => 'Akrual dan penyesuaian', 'applies_to' => 'manual_journal', 'description' => 'Pencatatan akrual atau penyesuaian pembukuan.', 'is_active' => true, 'is_system' => false, 'sort_order' => 90, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'other_manual_journal', 'name' => 'Jurnal manual lainnya', 'applies_to' => 'manual_journal', 'description' => 'Jenis bawaan untuk jurnal manual umum.', 'is_active' => true, 'is_system' => true, 'sort_order' => 100, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'customer_receipt', 'name' => 'Penerimaan jemaah', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 110, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'owner_capital', 'name' => 'Modal pemilik', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 120, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'owner_withdrawal', 'name' => 'Prive pemilik', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 130, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'operating_expense', 'name' => 'Biaya operasional', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 140, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'other_income', 'name' => 'Pendapatan lain-lain', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 150, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'customer_refund', 'name' => 'Refund jemaah', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 160, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'agent_commission', 'name' => 'Komisi agen', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 170, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'inventory', 'name' => 'Persediaan', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 180, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'vendor_cost', 'name' => 'Biaya dan pembayaran vendor', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 190, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'trip_revenue', 'name' => 'Pendapatan trip', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 200, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'period_adjustment', 'name' => 'Penyesuaian periode', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 210, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'legacy_unclassified', 'name' => 'Legacy belum terklasifikasi', 'applies_to' => 'system', 'description' => null, 'is_active' => true, 'is_system' => true, 'sort_order' => 220, 'created_at' => $now, 'updated_at' => $now],
        ]);

        Schema::table('financial_transactions', function (Blueprint $table): void {
            $table->foreign('category_code', 'financial_transactions_category_code_fk')
                ->references('code')
                ->on('financial_transaction_types')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table): void {
            $table->dropForeign('financial_transactions_category_code_fk');
        });

        Schema::dropIfExists('financial_transaction_types');
    }
};
