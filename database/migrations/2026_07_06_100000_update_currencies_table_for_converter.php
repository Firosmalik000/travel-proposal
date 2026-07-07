<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('currencies', function (Blueprint $table): void {
            if (! Schema::hasColumn('currencies', 'conversion_rate')) {
                $table->decimal('conversion_rate', 18, 6)->default(1)->after('name');
            }
        });

        if (Schema::hasColumn('currencies', 'symbol')) {
            Schema::table('currencies', function (Blueprint $table): void {
                $table->dropColumn('symbol');
            });
        }
    }

    public function down(): void
    {
        Schema::table('currencies', function (Blueprint $table): void {
            if (! Schema::hasColumn('currencies', 'symbol')) {
                $table->string('symbol', 16)->nullable()->after('name');
            }
        });

        if (Schema::hasColumn('currencies', 'conversion_rate')) {
            Schema::table('currencies', function (Blueprint $table): void {
                $table->dropColumn('conversion_rate');
            });
        }
    }
};
