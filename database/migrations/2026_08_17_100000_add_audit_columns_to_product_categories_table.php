<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('product_categories')) {
            return;
        }

        Schema::table('product_categories', function (Blueprint $table): void {
            if (! Schema::hasColumn('product_categories', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->index()->after('is_active');
            }

            if (! Schema::hasColumn('product_categories', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->index()->after('created_by');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('product_categories')) {
            return;
        }

        Schema::table('product_categories', function (Blueprint $table): void {
            if (Schema::hasColumn('product_categories', 'updated_by')) {
                $table->dropColumn('updated_by');
            }

            if (Schema::hasColumn('product_categories', 'created_by')) {
                $table->dropColumn('created_by');
            }
        });
    }
};
