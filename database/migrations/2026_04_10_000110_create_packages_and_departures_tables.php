<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_packages', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->json('name');
            $table->string('package_type')->default('reguler');
            $table->string('departure_city');
            $table->unsignedInteger('duration_days');
            $table->decimal('price', 12, 2)->nullable();
            $table->string('currency', 3)->default('IDR');
            $table->string('image_path')->nullable();
            $table->json('summary')->nullable();
            $table->json('content')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['package_type', 'is_active']);
            $table->index(['departure_city', 'is_active']);
            $table->index(['is_featured', 'is_active']);
        });

        Schema::create('travel_package_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('travel_product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['travel_package_id', 'travel_product_id'], 'tpp_package_product_unique');
        });

        Schema::create('departure_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_package_id')->nullable()->constrained()->nullOnDelete();
            $table->date('departure_date');
            $table->date('return_date')->nullable();
            $table->string('departure_city');
            $table->unsignedInteger('seats_total')->default(0);
            $table->unsignedInteger('seats_available')->default(0);
            $table->string('status')->default('open');
            $table->string('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['departure_date', 'is_active']);
            $table->index(['status', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departure_schedules');
        Schema::dropIfExists('travel_package_product');
        Schema::dropIfExists('travel_packages');
    }
};
