<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_itineraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_package_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('day_number');
            $table->json('title')->nullable();
            $table->json('description')->nullable();
            $table->timestamps();

            $table->unique(['travel_package_id', 'day_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_itineraries');
    }
};
