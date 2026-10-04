<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('vendor_bills')->exists()) {
            throw new RuntimeException('Masih ada tagihan vendor dengan jurnal HPP lama. Reklasifikasi harus ditinjau sebelum migration ini dijalankan.');
        }

        if (DB::table('financial_accounts')->where('code', '1401')->orWhere('system_key', 'vendor_service_pending')->exists()) {
            throw new RuntimeException('Kode akun 1401 atau kunci akun layanan vendor sudah digunakan.');
        }

        DB::table('financial_accounts')->insert([
            'code' => '1401', 'name' => 'Layanan Vendor Belum Digunakan', 'type' => 'asset',
            'is_cash_account' => false, 'currency' => 'IDR', 'system_key' => 'vendor_service_pending',
            'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
        ]);

        Schema::create('vendor_service_usages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vendor_bill_id')->constrained('vendor_bills')->restrictOnDelete();
            $table->foreignId('package_id')->constrained('packages')->restrictOnDelete();
            $table->date('usage_date');
            $table->unsignedBigInteger('amount_idr');
            $table->text('notes');
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('vendor_service_usages')->exists() || DB::table('financial_transactions')->where('transaction_type', 'vendor_service_use')->exists()) {
            throw new RuntimeException('Pengakuan layanan vendor sudah tercatat dan tidak dapat di-rollback.');
        }

        if (DB::table('financial_transaction_lines')->where('financial_account_id', DB::table('financial_accounts')->where('system_key', 'vendor_service_pending')->value('id'))->exists()) {
            throw new RuntimeException('Akun layanan vendor sudah memiliki jurnal dan tidak dapat di-rollback.');
        }

        Schema::dropIfExists('vendor_service_usages');
        DB::table('financial_accounts')->where('system_key', 'vendor_service_pending')->delete();
        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','reversal') NOT NULL");
    }
};
