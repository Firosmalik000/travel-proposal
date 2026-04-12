<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_services', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('description');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['sort_order', 'is_active']);
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('origin_city')->nullable();
            $table->foreignId('travel_package_id')->nullable()->constrained()->nullOnDelete();
            $table->json('quote');
            $table->unsignedTinyInteger('rating')->default(5);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_featured', 'is_active']);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->json('question');
            $table->json('answer');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['sort_order', 'is_active']);
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->json('title');
            $table->json('excerpt')->nullable();
            $table->json('body')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['published_at', 'is_active']);
            $table->index(['is_featured', 'is_active']);
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->string('category')->nullable();
            $table->json('description')->nullable();
            $table->string('image_path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index(['sort_order', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('travel_services');
    }
};
