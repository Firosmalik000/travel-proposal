<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->decimal('original_price', 12, 2)->nullable()->after('price');
            $table->string('discount_label')->nullable()->after('original_price');
            $table->dateTime('discount_ends_at')->nullable()->after('discount_label');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['original_price', 'discount_label', 'discount_ends_at']);
        });
    }
};
