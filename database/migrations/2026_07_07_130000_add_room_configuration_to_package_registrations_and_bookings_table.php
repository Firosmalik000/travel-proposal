<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_registrations', function (Blueprint $table): void {
            $table->json('room_configuration')->nullable()->after('passenger_count');
        });

        Schema::table('bookings', function (Blueprint $table): void {
            $table->json('room_configuration')->nullable()->after('passenger_count');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropColumn('room_configuration');
        });

        Schema::table('package_registrations', function (Blueprint $table): void {
            $table->dropColumn('room_configuration');
        });
    }
};
