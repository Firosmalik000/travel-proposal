<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_product', function (Blueprint $table): void {
            $table->unsignedInteger('quantity')->default(1)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('package_product', function (Blueprint $table): void {
            $table->dropColumn('quantity');
        });
    }
};
