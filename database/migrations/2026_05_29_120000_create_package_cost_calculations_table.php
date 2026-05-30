<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_cost_calculations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->foreignId('departure_schedule_id')->nullable()->constrained('departure_schedules')->nullOnDelete();
            $table->string('status', 30)->default('draft');
            $table->date('calculation_date')->nullable();
            $table->unsignedInteger('booking_count')->default(0);
            $table->unsignedInteger('customer_count')->default(0);
            $table->unsignedBigInteger('hotel_total')->default(0);
            $table->unsignedBigInteger('product_total')->default(0);
            $table->bigInteger('manual_adjustment')->default(0);
            $table->unsignedBigInteger('grand_total')->default(0);
            $table->unsignedBigInteger('hpp_per_customer')->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->json('warnings')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_cost_calculations');
    }
};
