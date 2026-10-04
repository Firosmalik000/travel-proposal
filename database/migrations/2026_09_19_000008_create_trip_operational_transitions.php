<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table): void {
            $table->string('operational_status', 30)->default('planning')->after('booking_status')->index();
        });

        Schema::create('trip_operational_transitions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->restrictOnDelete();
            $table->string('from_status', 30);
            $table->string('to_status', 30);
            $table->date('occurred_date');
            $table->unsignedBigInteger('revenue_amount_idr')->default(0);
            $table->json('checklist_snapshot')->nullable();
            $table->text('notes');
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->unsignedBigInteger('reversal_financial_transaction_id')->nullable();
            $table->unique('reversal_financial_transaction_id', 'trip_transition_reversal_tx_unique');
            $table->foreign('reversal_financial_transaction_id', 'trip_transition_reversal_tx_fk')->references('id')->on('financial_transactions')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reversed_at')->nullable();
            $table->text('reversal_reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['package_id', 'to_status', 'reversed_at'], 'trip_transition_status_index');
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','trip_revenue_recognition','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('trip_operational_transitions')->exists()
            || DB::table('financial_transactions')->where('transaction_type', 'trip_revenue_recognition')->exists()) {
            throw new RuntimeException('Histori status operasional trip sudah tersedia dan tidak dapat di-rollback.');
        }

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','reversal') NOT NULL");
        Schema::dropIfExists('trip_operational_transitions');
        Schema::table('packages', function (Blueprint $table): void {
            $table->dropIndex(['operational_status']);
            $table->dropColumn('operational_status');
        });
    }
};
