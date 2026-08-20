<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            $table->string('status', 20)->default('confirmed')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('booking_payments')->where('status', 'pending')->update(['status' => 'void']);

        Schema::table('booking_payments', function (Blueprint $table) {
            $table->enum('status', ['confirmed', 'void'])->default('confirmed')->change();
        });
    }
};
