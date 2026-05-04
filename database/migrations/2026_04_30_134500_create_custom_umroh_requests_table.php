<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_umroh_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code')->unique();

            $table->string('full_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('origin_city');
            $table->unsignedInteger('passenger_count');

            $table->string('group_type');
            $table->string('departure_month');
            $table->unsignedBigInteger('budget')->nullable();
            $table->string('focus');
            $table->string('room_preference');
            $table->text('notes')->nullable();

            $table->string('status')->default('new');
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_umroh_requests');
    }
};
