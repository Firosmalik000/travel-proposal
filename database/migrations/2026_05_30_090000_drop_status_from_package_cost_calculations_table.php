<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->dropColumn('status');
        });
    }

    public function down(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->string('status', 30)->default('draft')->after('departure_schedule_id');
        });
    }
};
