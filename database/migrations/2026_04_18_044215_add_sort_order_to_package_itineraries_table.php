<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('package_itineraries', 'sort_order')) {
            Schema::table('package_itineraries', function (Blueprint $table) {
                $table->unsignedSmallInteger('sort_order')->default(1)->after('day_number');
            });
        }

        DB::table('package_itineraries')->update([
            'sort_order' => DB::raw('day_number'),
        ]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('package_itineraries', 'sort_order')) {
            Schema::table('package_itineraries', function (Blueprint $table) {
                $table->dropColumn('sort_order');
            });
        }
    }
};
