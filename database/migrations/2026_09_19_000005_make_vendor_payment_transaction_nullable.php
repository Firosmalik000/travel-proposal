<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_bill_payments', function (Blueprint $table): void {
            $table->dropForeign(['financial_transaction_id']);
            $table->foreignId('financial_transaction_id')->nullable()->change();
            $table->foreign('financial_transaction_id')->references('id')->on('financial_transactions')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vendor_bill_payments', function (Blueprint $table): void {
            $table->dropForeign(['financial_transaction_id']);
            $table->foreignId('financial_transaction_id')->nullable(false)->change();
            $table->foreign('financial_transaction_id')->references('id')->on('financial_transactions')->restrictOnDelete();
        });
    }
};
