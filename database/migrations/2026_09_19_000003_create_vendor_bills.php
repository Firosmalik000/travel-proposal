<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_bills', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_vendor_id')->nullable()->constrained('package_vendors')->restrictOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->restrictOnDelete();
            $table->string('vendor_invoice_number', 100)->nullable();
            $table->date('bill_date');
            $table->date('due_date')->nullable();
            $table->char('currency', 3)->default('IDR');
            $table->decimal('amount_original', 20, 4);
            $table->unsignedBigInteger('amount_idr');
            $table->unsignedBigInteger('paid_amount_idr')->default(0);
            $table->enum('status', ['open', 'partially_paid', 'paid', 'void'])->default('open');
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('posted_financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'due_date']);
            $table->index(['package_vendor_id', 'package_id']);
        });

        Schema::create('vendor_bill_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vendor_bill_id')->constrained('vendor_bills')->restrictOnDelete();
            $table->unsignedBigInteger('amount_idr');
            $table->date('payment_date');
            $table->foreignId('financial_account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignId('financial_transaction_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','vendor_bill','vendor_payment','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('vendor_bill_payments')->exists() || DB::table('vendor_bills')->exists()) {
            throw new RuntimeException('Migration vendor tidak dapat di-rollback setelah data vendor tersimpan.');
        }

        Schema::dropIfExists('vendor_bill_payments');
        Schema::dropIfExists('vendor_bills');
        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','capital_contribution','owner_withdrawal','operating_expense','customer_refund','agent_commission','inventory_purchase','inventory_issue','reversal') NOT NULL");
    }
};
