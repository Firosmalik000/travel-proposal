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
        Schema::create('agent_package_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->enum('fee_type', ['fixed', 'percentage']);
            $table->decimal('fee_value', 14, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['agent_profile_id', 'package_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_package_fees');
    }
};
