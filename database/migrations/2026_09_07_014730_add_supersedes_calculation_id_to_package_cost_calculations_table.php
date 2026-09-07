<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->foreignId('supersedes_calculation_id')
                ->nullable()
                ->after('package_id')
                ->constrained('package_cost_calculations', indexName: 'pcc_supersedes_id_fk')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('package_cost_calculations', function (Blueprint $table): void {
            $table->dropForeign('pcc_supersedes_id_fk');
            $table->dropColumn('supersedes_calculation_id');
        });
    }
};
