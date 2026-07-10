<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->unsignedBigInteger('tour_leader_fee')->nullable()->after('manual_adjustment');
            $table->unsignedBigInteger('muthawwif_fee')->nullable()->after('tour_leader_fee');
        });
    }

    public function down(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->dropColumn(['tour_leader_fee', 'muthawwif_fee']);
        });
    }
};
