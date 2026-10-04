<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_periods', function (Blueprint $table): void {
            $table->id();
            $table->char('period_code', 7)->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'start_date', 'end_date']);
        });

        Schema::create('financial_period_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_period_id')->constrained()->restrictOnDelete();
            $table->enum('action', ['closed', 'reopened']);
            $table->text('reason');
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['financial_period_id', 'occurred_at']);
        });

        Schema::create('bank_reconciliations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->date('statement_date');
            $table->bigInteger('statement_balance_idr');
            $table->bigInteger('ledger_balance_idr');
            $table->bigInteger('difference_idr');
            $table->enum('status', ['matched', 'difference']);
            $table->text('notes')->nullable();
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reconciled_at');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['financial_account_id', 'statement_date'], 'bank_reconciliation_account_date_unique');
            $table->index(['status', 'statement_date']);
        });

        Schema::table('financial_transactions', function (Blueprint $table): void {
            $table->foreignId('adjustment_of_id')->nullable()->after('reversal_of_id')->constrained('financial_transactions')->restrictOnDelete();
            $table->text('adjustment_reason')->nullable()->after('adjustment_of_id');
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','trip_revenue_recognition','period_adjustment','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('financial_period_events')->exists()
            || DB::table('bank_reconciliations')->exists()
            || DB::table('financial_transactions')->whereNotNull('adjustment_of_id')->exists()) {
            throw new RuntimeException('Kontrol periode atau rekonsiliasi sudah memiliki data dan tidak dapat di-rollback.');
        }

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','vendor_service_use','trip_revenue_recognition','reversal') NOT NULL");

        Schema::table('financial_transactions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('adjustment_of_id');
            $table->dropColumn('adjustment_reason');
        });

        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('financial_period_events');
        Schema::dropIfExists('financial_periods');
    }
};
