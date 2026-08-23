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
        Schema::table('products', function (Blueprint $table) {
            $table->string('visibility', 20)->default('master')->after('product_type');
            $table->foreignId('package_id')
                ->nullable()
                ->after('visibility')
                ->constrained('packages')
                ->cascadeOnDelete();

            $table->index(['visibility', 'is_active']);
            $table->index(['package_id', 'product_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['visibility', 'is_active']);
            $table->dropIndex(['package_id', 'product_type']);
            $table->dropConstrainedForeignId('package_id');
            $table->dropColumn('visibility');
        });
    }
};
