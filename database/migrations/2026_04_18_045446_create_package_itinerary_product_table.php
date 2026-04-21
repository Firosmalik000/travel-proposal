<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_itinerary_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_itinerary_id')->constrained()->cascadeOnDelete();
            $table->foreignId('travel_product_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['package_itinerary_id', 'travel_product_id'], 'pip_itinerary_product_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_itinerary_product');
    }
};
