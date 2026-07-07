<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->string('calculation_mode', 50)
                ->default('legacy_assignment')
                ->after('departure_schedule_id');
        });
    }

    public function down(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->dropColumn('calculation_mode');
        });
    }
};
