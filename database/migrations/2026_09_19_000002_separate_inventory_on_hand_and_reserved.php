<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table): void {
            $table->unsignedInteger('reserved_quantity')->default(0)->after('quantity');
            $table->unsignedBigInteger('average_unit_cost_idr')->default(0)->after('reserved_quantity');
        });

        Schema::table('inventory_stock_mutations', function (Blueprint $table): void {
            $table->integer('reserved_quantity_change')->default(0)->after('quantity_change');
            $table->unsignedBigInteger('unit_cost_idr')->nullable()->after('quantity_after');
            $table->unsignedBigInteger('total_cost_idr')->nullable()->after('unit_cost_idr');
            $table->string('idempotency_key', 150)->nullable()->unique()->after('total_cost_idr');
            $table->char('payload_hash', 64)->nullable()->after('idempotency_key');
        });

        DB::transaction(function (): void {
            $reservations = DB::table('inventory_stock_mutations')
                ->where('change_type', 'booking_allocation_sync')
                ->select('inventory_item_id')
                ->selectRaw('GREATEST(0, -SUM(quantity_change)) as reserved_quantity')
                ->groupBy('inventory_item_id')
                ->get();

            foreach ($reservations as $reservation) {
                $reserved = (int) $reservation->reserved_quantity;
                DB::table('inventory_items')->where('id', $reservation->inventory_item_id)->increment('quantity', $reserved);
                DB::table('inventory_items')->where('id', $reservation->inventory_item_id)->update(['reserved_quantity' => $reserved]);
            }

            DB::table('inventory_stock_mutations')
                ->where('change_type', 'booking_allocation_sync')
                ->update(['reserved_quantity_change' => DB::raw('quantity_change * -1')]);
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('financial_transactions')->whereIn('transaction_type', ['inventory_purchase', 'inventory_issue'])->exists()) {
            throw new RuntimeException('Migration tidak dapat di-rollback karena transaksi inventory sudah tersedia.');
        }

        DB::transaction(function (): void {
            DB::table('inventory_items')->where('reserved_quantity', '>', 0)->update([
                'quantity' => DB::raw('quantity - reserved_quantity'),
            ]);
        });

        Schema::table('inventory_stock_mutations', function (Blueprint $table): void {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn(['reserved_quantity_change', 'unit_cost_idr', 'total_cost_idr', 'idempotency_key', 'payload_hash']);
        });
        Schema::table('inventory_items', function (Blueprint $table): void {
            $table->dropColumn(['reserved_quantity', 'average_unit_cost_idr']);
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','reversal') NOT NULL");
    }
};
