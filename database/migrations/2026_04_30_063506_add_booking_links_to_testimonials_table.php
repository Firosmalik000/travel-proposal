<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->foreignId('booking_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('departure_schedule_id')->nullable()->after('package_id')->constrained()->nullOnDelete();

            $table->unique('booking_id');
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropUnique(['booking_id']);
            $table->dropConstrainedForeignId('booking_id');
            $table->dropConstrainedForeignId('departure_schedule_id');
        });
    }
};
