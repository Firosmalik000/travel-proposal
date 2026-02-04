<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. data_makan_karyawan - add created_by and updated_by (only if not exists)
        if (!Schema::hasColumn('data_makan_karyawan', 'created_by')) {
            Schema::table('data_makan_karyawan', function (Blueprint $table) {
                $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('data_makan_karyawan', 'updated_by')) {
            Schema::table('data_makan_karyawan', function (Blueprint $table) {
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            });
        }

        // 2. recruitment - add foreign key constraints (only if not exists)
        // Check if foreign keys exist by trying to get constraint info
        $hasCreatedByFk = false;
        $hasUpdatedByFk = false;

        try {
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME = 'recruitment'
                AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            ", [env('DB_DATABASE')]);

            $foreignKeyNames = array_column($foreignKeys, 'CONSTRAINT_NAME');
            $hasCreatedByFk = in_array('recruitment_created_by_foreign', $foreignKeyNames);
            $hasUpdatedByFk = in_array('recruitment_updated_by_foreign', $foreignKeyNames);
        } catch (\Exception $e) {
            // If we can't check, assume they don't exist
        }

        if (!$hasCreatedByFk) {
            Schema::table('recruitment', function (Blueprint $table) {
                $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            });
        }

        if (!$hasUpdatedByFk) {
            Schema::table('recruitment', function (Blueprint $table) {
                $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. data_makan_karyawan
        Schema::table('data_makan_karyawan', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['created_by', 'updated_by']);
        });

        // 2. recruitment
        Schema::table('recruitment', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });
    }
};
