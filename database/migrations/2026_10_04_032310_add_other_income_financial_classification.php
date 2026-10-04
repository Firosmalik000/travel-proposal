<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','other_income','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','trip_revenue_recognition','period_adjustment','reversal') NOT NULL");

        DB::table('financial_accounts')->updateOrInsert(
            ['system_key' => 'other_income'],
            [
                'code' => '4901',
                'name' => 'Pendapatan Lain-lain',
                'type' => 'revenue',
                'is_cash_account' => false,
                'cash_account_type' => null,
                'account_number' => null,
                'currency' => 'IDR',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::table('financial_transactions')->where('transaction_type', 'other_income')->exists()) {
            throw new RuntimeException('Rollback dibatalkan karena transaksi pendapatan lain-lain sudah tersedia.');
        }

        $accountId = DB::table('financial_accounts')->where('system_key', 'other_income')->value('id');

        if ($accountId !== null && ! DB::table('financial_transaction_lines')->where('financial_account_id', $accountId)->exists()) {
            DB::table('financial_accounts')->where('id', $accountId)->delete();
        }

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','trip_revenue_recognition','period_adjustment','reversal') NOT NULL");
    }
};
