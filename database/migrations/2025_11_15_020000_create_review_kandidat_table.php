<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('review_kandidat', function (Blueprint $table) {
            $table->id();
            $table->text('review');
            $table->enum('type', ['hrd', 'user'])->comment('Type of reviewer: hrd or user');
            $table->foreignId('recruitment_id')->constrained('recruitment')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_kandidat');
    }
};
