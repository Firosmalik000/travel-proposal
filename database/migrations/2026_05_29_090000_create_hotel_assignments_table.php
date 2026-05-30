<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->foreignId('departure_schedule_id')->constrained('departure_schedules')->cascadeOnDelete();
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $table->string('status')->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['departure_schedule_id', 'hotel_id'], 'hotel_assignments_schedule_hotel_unique');
        });

        Schema::create('hotel_assignment_rooms', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('hotel_assignment_id')->constrained('hotel_assignments')->cascadeOnDelete();
            $table->foreignId('room_type_id')->constrained('hotel_room_types')->cascadeOnDelete();
            $table->unsignedInteger('room_count');
            $table->unsignedSmallInteger('room_capacity');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['hotel_assignment_id', 'room_type_id'], 'hotel_assignment_rooms_assignment_room_type_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_assignment_rooms');
        Schema::dropIfExists('hotel_assignments');
    }
};
