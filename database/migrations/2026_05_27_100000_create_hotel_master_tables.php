<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_countries', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
        });

        Schema::create('hotel_cities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('country_id')->constrained('hotel_countries')->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->unique(['country_id', 'name']);
            $table->index(['country_id', 'is_active']);
        });

        Schema::create('hotel_room_types', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
        });

        Schema::create('hotels', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('country_id')->constrained('hotel_countries')->cascadeOnDelete();
            $table->foreignId('city_id')->constrained('hotel_cities')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('currency', 3)->default('IDR');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->index(['country_id', 'city_id', 'is_active']);
            $table->unique(['city_id', 'name']);
        });

        Schema::create('hotel_prices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->cascadeOnDelete();
            $table->foreignId('room_type_id')->constrained('hotel_room_types')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedBigInteger('price');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->index(['hotel_id', 'room_type_id']);
            $table->index(['period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_prices');
        Schema::dropIfExists('hotels');
        Schema::dropIfExists('hotel_room_types');
        Schema::dropIfExists('hotel_cities');
        Schema::dropIfExists('hotel_countries');
    }
};
