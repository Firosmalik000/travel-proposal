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
        Schema::create('agent_referral_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_profile_id')->constrained()->cascadeOnDelete();
            $table->string('visitor_hash', 64);
            $table->string('landing_path', 500);
            $table->date('visited_on');
            $table->unsignedInteger('visit_count')->default(1);
            $table->timestamps();

            $table->unique(['agent_profile_id', 'visitor_hash', 'visited_on'], 'agent_referral_daily_visitor_unique');
            $table->index(['agent_profile_id', 'visited_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_referral_visits');
    }
};
