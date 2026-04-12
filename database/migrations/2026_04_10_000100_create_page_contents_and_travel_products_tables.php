<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->json('title');
            $table->json('excerpt')->nullable();
            $table->json('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
        });

        Schema::create('travel_products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->json('name');
            $table->string('product_type')->nullable();
            $table->json('description')->nullable();
            $table->json('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_products');
        Schema::dropIfExists('page_contents');
    }
};
