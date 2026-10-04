<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            $table->foreignId('cashflow_id')->nullable()->constrained('cashflows')->nullOnDelete();
            $table->string('attachment_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            $table->dropForeign(['cashflow_id']);
            $table->dropColumn(['cashflow_id', 'attachment_path']);
        });
    }
};
