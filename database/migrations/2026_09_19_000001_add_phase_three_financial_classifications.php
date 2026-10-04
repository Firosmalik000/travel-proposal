<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();

        DB::table('financial_accounts')->insertOrIgnore([
            [
                'system_key' => 'owner_withdrawal',
                'code' => '3101',
                'name' => 'Prive Pemilik',
                'type' => 'equity',
                'is_cash_account' => false,
                'cash_account_type' => null,
                'account_number' => null,
                'currency' => 'IDR',
                'is_active' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','reversal') NOT NULL");

        Schema::table('agent_commissions', function (Blueprint $table): void {
            $table->foreignId('financial_account_id')->nullable()->after('currency')->constrained('financial_accounts')->restrictOnDelete();
            $table->date('payment_date')->nullable()->after('financial_account_id');
            $table->decimal('exchange_rate', 20, 8)->nullable()->after('payment_date');
            $table->unsignedBigInteger('amount_idr')->nullable()->after('exchange_rate');
        });
    }

    public function down(): void
    {
        if (DB::table('financial_transactions')->whereIn('transaction_type', [
            'capital_contribution',
            'owner_withdrawal',
            'operating_expense',
            'customer_refund',
            'agent_commission',
        ])->exists()) {
            throw new RuntimeException('Migration tidak dapat di-rollback karena transaksi Tahap 3 sudah tersedia.');
        }

        Schema::table('agent_commissions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('financial_account_id');
            $table->dropColumn(['payment_date', 'exchange_rate', 'amount_idr']);
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','reversal') NOT NULL");
    }
};
