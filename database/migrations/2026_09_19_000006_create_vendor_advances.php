<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_advances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_vendor_id')->nullable()->constrained('package_vendors')->restrictOnDelete();
            $table->char('currency', 3)->default('IDR');
            $table->unsignedBigInteger('amount_idr');
            $table->unsignedBigInteger('applied_amount_idr')->default(0);
            $table->enum('status', ['open', 'partially_applied', 'applied', 'void'])->default('open');
            $table->date('advance_date');
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('vendor_advance_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vendor_advance_id')->constrained('vendor_advances')->restrictOnDelete();
            $table->foreignId('vendor_bill_id')->constrained('vendor_bills')->restrictOnDelete();
            $table->unsignedBigInteger('amount_idr');
            $table->date('allocation_date');
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','vendor_advance_payment','vendor_advance_application','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('vendor_advance_allocations')->exists() || DB::table('vendor_advances')->exists()) {
            throw new RuntimeException('Migration uang muka vendor tidak dapat di-rollback setelah data tersimpan.');
        }
        Schema::dropIfExists('vendor_advance_allocations');
        Schema::dropIfExists('vendor_advances');
        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','reversal') NOT NULL");
    }
};
