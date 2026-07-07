<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_product', function (Blueprint $table): void {
            $table->unsignedInteger('multiplier_per_pax')->default(1)->after('sort_order');
        });

        DB::table('package_product')->update([
            'multiplier_per_pax' => DB::raw('quantity'),
        ]);

        Schema::table('package_product', function (Blueprint $table): void {
            $table->dropColumn('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('package_product', function (Blueprint $table): void {
            $table->unsignedInteger('quantity')->default(1)->after('sort_order');
        });

        DB::table('package_product')->update([
            'quantity' => DB::raw('multiplier_per_pax'),
        ]);

        Schema::table('package_product', function (Blueprint $table): void {
            $table->dropColumn('multiplier_per_pax');
        });
    }
};
