<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->cascadeOnDelete();
            $table->string('draft_key', 80);
            $table->json('payload');
            $table->json('temporary_images')->nullable();
            $table->timestamp('base_package_updated_at')->nullable();
            $table->timestamp('last_autosaved_at');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['user_id', 'draft_key']);
            $table->index(['user_id', 'expires_at']);
            $table->index(['package_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_drafts');
    }
};
