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
        // Drop attachment column if exists (from old migration)
        if (Schema::hasColumn('cashflows', 'attachment')) {
            Schema::table('cashflows', function (Blueprint $table) {
                $table->dropColumn('attachment');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cashflows', function (Blueprint $table) {
            $table->string('attachment')->nullable()->after('method');
        });
    }
};
