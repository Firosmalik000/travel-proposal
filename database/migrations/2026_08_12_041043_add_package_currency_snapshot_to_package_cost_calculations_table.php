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
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->string('package_currency', 10)->default('IDR')->after('currency');
            $table->decimal('package_conversion_rate_to_idr', 20, 6)->default(1)->after('package_currency');
            $table->string('package_conversion_rate_source', 30)->nullable()->after('package_conversion_rate_to_idr');
            $table->timestamp('package_conversion_rate_fetched_at')->nullable()->after('package_conversion_rate_source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->dropColumn([
                'package_currency',
                'package_conversion_rate_to_idr',
                'package_conversion_rate_source',
                'package_conversion_rate_fetched_at',
            ]);
        });
    }
};
