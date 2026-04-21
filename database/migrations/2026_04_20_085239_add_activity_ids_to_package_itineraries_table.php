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
        if (Schema::hasColumn('package_itineraries', 'activity_ids')) {
            return;
        }

        Schema::table('package_itineraries', function (Blueprint $table) {
            $table->json('activity_ids')->nullable()->after('travel_package_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('package_itineraries', 'activity_ids')) {
            return;
        }

        Schema::table('package_itineraries', function (Blueprint $table) {
            $table->dropColumn('activity_ids');
        });
    }
};
