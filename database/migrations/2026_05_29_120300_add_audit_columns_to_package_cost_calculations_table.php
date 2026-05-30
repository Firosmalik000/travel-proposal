<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->unsignedBigInteger('created_by')->nullable()->after('deleted_at');
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->dropColumn(['created_by', 'updated_by']);
        });
    }
};
