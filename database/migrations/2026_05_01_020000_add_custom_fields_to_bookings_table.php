<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_type')->default('regular')->after('departure_schedule_id');
            $table->date('custom_departure_date')->nullable()->after('booking_type');
            $table->date('custom_return_date')->nullable()->after('custom_departure_date');
            $table->unsignedBigInteger('custom_total_amount')->nullable()->after('custom_return_date');
            $table->string('custom_currency', 3)->nullable()->after('custom_total_amount');

            $table->index('booking_type');
        });

        DB::table('bookings')
            ->whereNull('booking_type')
            ->update([
                'booking_type' => 'regular',
            ]);

        DB::table('bookings')
            ->whereIn('id', function ($query) {
                $query
                    ->select('booking_id')
                    ->from('custom_umroh_requests')
                    ->whereNotNull('booking_id');
            })
            ->update([
                'booking_type' => 'custom',
            ]);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['booking_type']);
            $table->dropColumn([
                'booking_type',
                'custom_departure_date',
                'custom_return_date',
                'custom_total_amount',
                'custom_currency',
            ]);
        });
    }
};
