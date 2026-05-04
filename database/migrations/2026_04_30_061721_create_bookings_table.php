<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('departure_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->string('full_name');
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->string('origin_city');
            $table->unsignedSmallInteger('passenger_count')->default(1);
            $table->text('notes')->nullable();
            $table->string('status')->default('registered');
            $table->timestamps();

            $table->index(['package_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
