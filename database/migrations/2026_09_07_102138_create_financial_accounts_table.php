<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_accounts', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 150);
            $table->enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
            $table->boolean('is_cash_account')->default(false);
            $table->enum('cash_account_type', ['customer_funds', 'operating', 'petty_cash', 'legacy'])->nullable();
            $table->string('account_number', 100)->nullable();
            $table->char('currency', 3)->default('IDR');
            $table->string('system_key', 80)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index(['is_cash_account', 'cash_account_type']);
        });

        $timestamp = now();
        DB::table('financial_accounts')->insert([
            ['code' => '1001', 'name' => 'Rekening Penampungan Jemaah', 'type' => 'asset', 'is_cash_account' => true, 'cash_account_type' => 'customer_funds', 'currency' => 'IDR', 'system_key' => 'customer_funds', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '1002', 'name' => 'Bank Operasional', 'type' => 'asset', 'is_cash_account' => true, 'cash_account_type' => 'operating', 'currency' => 'IDR', 'system_key' => 'operating_bank', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '1003', 'name' => 'Kas Kecil', 'type' => 'asset', 'is_cash_account' => true, 'cash_account_type' => 'petty_cash', 'currency' => 'IDR', 'system_key' => 'petty_cash', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '1099', 'name' => 'Kas Legacy Belum Terklasifikasi', 'type' => 'asset', 'is_cash_account' => true, 'cash_account_type' => 'legacy', 'currency' => 'IDR', 'system_key' => 'legacy_cash', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '1101', 'name' => 'Piutang Jemaah', 'type' => 'asset', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'customer_receivable', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '1201', 'name' => 'Uang Muka Vendor', 'type' => 'asset', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'vendor_advance', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '1301', 'name' => 'Persediaan', 'type' => 'asset', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'inventory', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '2001', 'name' => 'Uang Muka Jemaah', 'type' => 'liability', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'customer_advance', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '2101', 'name' => 'Hutang Vendor', 'type' => 'liability', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'vendor_payable', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '3001', 'name' => 'Modal Pemilik', 'type' => 'equity', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'owner_equity', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '3099', 'name' => 'Saldo Awal', 'type' => 'equity', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'opening_balance_equity', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '3999', 'name' => 'Legacy Belum Terklasifikasi', 'type' => 'equity', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'legacy_unclassified', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '4001', 'name' => 'Pendapatan Trip', 'type' => 'revenue', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'trip_revenue', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '5001', 'name' => 'HPP Trip', 'type' => 'expense', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'trip_cost', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '5101', 'name' => 'Komisi Agen', 'type' => 'expense', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'agent_commission', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
            ['code' => '6001', 'name' => 'Biaya Operasional', 'type' => 'expense', 'is_cash_account' => false, 'cash_account_type' => null, 'currency' => 'IDR', 'system_key' => 'operating_expense', 'is_active' => true, 'created_at' => $timestamp, 'updated_at' => $timestamp],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_accounts');
    }
};
