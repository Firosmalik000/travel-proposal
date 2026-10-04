<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_payments', function (Blueprint $table): void {
            $table->dropForeign(['cashflow_id']);
            $table->unique('cashflow_id', 'booking_payments_cashflow_id_unique');
            $table->foreign('cashflow_id')
                ->references('id')
                ->on('cashflows')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('booking_payments', function (Blueprint $table): void {
            $table->dropForeign(['cashflow_id']);
            $table->dropUnique('booking_payments_cashflow_id_unique');
            $table->foreign('cashflow_id')
                ->references('id')
                ->on('cashflows')
                ->nullOnDelete();
        });
    }
};
