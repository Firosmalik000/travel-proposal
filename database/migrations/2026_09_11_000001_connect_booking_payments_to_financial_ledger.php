<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_payments', function (Blueprint $table): void {
            $table->foreignId('financial_account_id')
                ->nullable()
                ->after('cashflow_id')
                ->constrained('financial_accounts')
                ->restrictOnDelete();
            $table->char('currency', 3)->nullable()->after('amount');
            $table->decimal('exchange_rate', 20, 8)->nullable()->after('currency');
            $table->unsignedBigInteger('amount_idr')->nullable()->after('exchange_rate');
            $table->string('idempotency_key', 100)->nullable()->unique()->after('status');
            $table->text('attachment_override_reason')->nullable()->after('attachment_path');

            $table->index(['financial_account_id', 'status'], 'booking_payments_account_status_index');
        });

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','booking_payment','reversal') NOT NULL");
    }

    public function down(): void
    {
        if (DB::table('financial_transactions')->where('transaction_type', 'booking_payment')->exists()) {
            throw new RuntimeException('Rollback ditolak karena transaksi Booking Payment sudah tersedia.');
        }

        DB::statement("ALTER TABLE financial_transactions MODIFY transaction_type ENUM('opening_balance','manual_journal','transfer','legacy_unclassified','reversal') NOT NULL");

        Schema::table('booking_payments', function (Blueprint $table): void {
            $table->dropIndex('booking_payments_account_status_index');
            $table->dropUnique(['idempotency_key']);
            $table->dropConstrainedForeignId('financial_account_id');
            $table->dropColumn([
                'currency',
                'exchange_rate',
                'amount_idr',
                'idempotency_key',
                'attachment_override_reason',
            ]);
        });
    }
};
