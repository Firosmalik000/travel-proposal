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
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->string('category_code', 60)->nullable()->after('transaction_type');
            $table->index(['category_code', 'status']);
        });

        $this->dropUpdateGuard();

        DB::table('financial_transactions')
            ->whereNull('category_code')
            ->update([
                'category_code' => DB::raw("CASE transaction_type
                    WHEN 'opening_balance' THEN 'opening_balance'
                    WHEN 'transfer' THEN 'inter_account_transfer'
                    WHEN 'manual_journal' THEN 'other_manual_journal'
                    WHEN 'booking_payment' THEN 'customer_receipt'
                    WHEN 'capital_contribution' THEN 'owner_capital'
                    WHEN 'owner_withdrawal' THEN 'owner_withdrawal'
                    WHEN 'operating_expense' THEN 'operating_expense'
                    WHEN 'other_income' THEN 'other_income'
                    WHEN 'customer_refund' THEN 'customer_refund'
                    WHEN 'agent_commission' THEN 'agent_commission'
                    WHEN 'inventory_purchase' THEN 'inventory'
                    WHEN 'inventory_issue' THEN 'inventory'
                    WHEN 'vendor_bill' THEN 'vendor_cost'
                    WHEN 'vendor_payment' THEN 'vendor_cost'
                    WHEN 'vendor_advance_payment' THEN 'vendor_cost'
                    WHEN 'vendor_advance_application' THEN 'vendor_cost'
                    WHEN 'vendor_service_use' THEN 'vendor_cost'
                    WHEN 'trip_revenue_recognition' THEN 'trip_revenue'
                    WHEN 'period_adjustment' THEN 'period_adjustment'
                    WHEN 'legacy_unclassified' THEN 'legacy_unclassified'
                    WHEN 'reversal' THEN 'recording_correction'
                    ELSE 'other_manual_journal'
                END"),
            ]);

        DB::table('financial_transactions')
            ->whereNotNull('reversal_of_id')
            ->orderBy('id')
            ->chunkById(500, function ($reversals): void {
                $categories = DB::table('financial_transactions')
                    ->whereIn('id', $reversals->pluck('reversal_of_id'))
                    ->pluck('category_code', 'id');

                foreach ($reversals as $reversal) {
                    $originalCategory = $categories->get($reversal->reversal_of_id);
                    if ($originalCategory) {
                        DB::table('financial_transactions')
                            ->where('id', $reversal->id)
                            ->update(['category_code' => $originalCategory]);
                    }
                }
            });

        $this->createUpdateGuard(true);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropUpdateGuard();

        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropIndex(['category_code', 'status']);
            $table->dropColumn('category_code');
        });

        $this->createUpdateGuard(false);
    }

    private function dropUpdateGuard(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::unprepared('DROP TRIGGER IF EXISTS financial_transactions_before_update');
        }
    }

    private function createUpdateGuard(bool $includeCategory): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $categoryGuard = $includeCategory ? 'AND (NEW.category_code <=> OLD.category_code)' : '';

        DB::unprepared(<<<SQL
            CREATE TRIGGER financial_transactions_before_update
            BEFORE UPDATE ON financial_transactions
            FOR EACH ROW
            BEGIN
                IF OLD.status IN ('posted', 'reversed') AND NOT (
                    OLD.status = 'posted' AND NEW.status = 'reversed'
                    AND NEW.transaction_number = OLD.transaction_number
                    AND NEW.transaction_date = OLD.transaction_date
                    AND NEW.transaction_type = OLD.transaction_type
                    {$categoryGuard}
                    AND (NEW.source_type <=> OLD.source_type)
                    AND (NEW.source_id <=> OLD.source_id)
                    AND (NEW.package_id <=> OLD.package_id)
                    AND NEW.currency = OLD.currency
                    AND NEW.exchange_rate = OLD.exchange_rate
                    AND NEW.amount_original = OLD.amount_original
                    AND NEW.amount_idr = OLD.amount_idr
                    AND NEW.idempotency_key = OLD.idempotency_key
                    AND NEW.payload_hash = OLD.payload_hash
                    AND (NEW.reversal_of_id <=> OLD.reversal_of_id)
                    AND (NEW.adjustment_of_id <=> OLD.adjustment_of_id)
                    AND (NEW.adjustment_reason <=> OLD.adjustment_reason)
                    AND (NEW.description <=> OLD.description)
                    AND (NEW.posted_by <=> OLD.posted_by)
                    AND (NEW.posted_at <=> OLD.posted_at)
                    AND NEW.reversed_at IS NOT NULL
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaksi posted/reversed bersifat tetap; koreksi wajib melalui reversal.';
                END IF;

                IF OLD.status = 'draft' AND NEW.status = 'posted' AND (
                    (SELECT COUNT(*) FROM financial_transaction_lines WHERE financial_transaction_id = OLD.id) < 2
                    OR (SELECT COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount_idr ELSE -amount_idr END), 0) FROM financial_transaction_lines WHERE financial_transaction_id = OLD.id) <> 0
                ) THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaksi tidak dapat diposting karena baris jurnal belum seimbang.';
                END IF;
            END
        SQL);
    }
};
