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
        Schema::table('custom_umroh_requests', function (Blueprint $table) {
            $table->date('departure_date')->nullable()->after('departure_month');
            $table->date('return_date')->nullable()->after('departure_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('custom_umroh_requests', function (Blueprint $table) {
            $table->dropColumn(['departure_date', 'return_date']);
        });
    }
};
