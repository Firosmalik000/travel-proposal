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
        Schema::table('recruitment', function (Blueprint $table) {
            // Drop existing review columns (text) and recreate as foreign keys
            $table->dropColumn(['review_hrd', 'review_user']);
        });

        Schema::table('recruitment', function (Blueprint $table) {
            // Review references as foreign keys to review_kandidat table
            $table->foreignId('review_hrd')->nullable()->after('reason_reject_hrd')->constrained('review_kandidat')->onDelete('set null');
            $table->foreignId('review_user')->nullable()->after('reason_reject_user')->constrained('review_kandidat')->onDelete('set null');

            // Boss approval tracking (new columns)
            $table->foreignId('accepted_boss_by')->nullable()->after('reason_reject_offer')->constrained('users')->onDelete('set null');
            $table->timestamp('accepted_boss_at')->nullable()->after('accepted_boss_by');

            // Boss rejection tracking (new columns)
            $table->foreignId('rejected_boss_by')->nullable()->after('accepted_boss_at')->constrained('users')->onDelete('set null');
            $table->timestamp('rejected_boss_at')->nullable()->after('rejected_boss_by');

            // Rejection reason unified (can be from HRD, User, or Boss)
            $table->text('reason_reject')->nullable()->after('rejected_boss_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['review_hrd']);
            $table->dropForeign(['review_user']);
            $table->dropForeign(['accepted_boss_by']);
            $table->dropForeign(['rejected_boss_by']);

            // Drop columns
            $table->dropColumn([
                'review_hrd',
                'review_user',
                'accepted_boss_by',
                'accepted_boss_at',
                'rejected_boss_by',
                'rejected_boss_at',
                'reason_reject'
            ]);
        });

        // Recreate original text columns
        Schema::table('recruitment', function (Blueprint $table) {
            $table->text('review_hrd')->nullable()->comment('HRD review/notes')->after('reason_reject_hrd');
            $table->text('review_user')->nullable()->comment('User/Technical review/notes')->after('reason_reject_user');
        });
    }
};
