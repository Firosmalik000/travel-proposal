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
        Schema::table('package_registrations', function (Blueprint $table): void {
            $table->foreignId('agent_profile_id')->nullable()->after('customer_id')->constrained()->nullOnDelete();
            $table->string('referral_code', 40)->nullable()->after('agent_profile_id');
        });

        Schema::table('bookings', function (Blueprint $table): void {
            $table->foreignId('agent_profile_id')->nullable()->after('customer_id')->constrained()->nullOnDelete();
            $table->string('referral_code', 40)->nullable()->after('agent_profile_id');
            $table->index(['agent_profile_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropIndex(['agent_profile_id', 'status']);
            $table->dropConstrainedForeignId('agent_profile_id');
            $table->dropColumn('referral_code');
        });

        Schema::table('package_registrations', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('agent_profile_id');
            $table->dropColumn('referral_code');
        });
    }
};
