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
        // Add audit columns to departments table
        if (Schema::hasTable('departments') && !Schema::hasColumn('departments', 'created_by')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->onDelete('set null');
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            });
        }

        // Add audit columns to jabatan table
        if (Schema::hasTable('jabatan') && !Schema::hasColumn('jabatan', 'created_by')) {
            Schema::table('jabatan', function (Blueprint $table) {
                $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->onDelete('set null');
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            });
        }

        // Add audit columns to menus table
        if (Schema::hasTable('menus') && !Schema::hasColumn('menus', 'created_by')) {
            Schema::table('menus', function (Blueprint $table) {
                $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->onDelete('set null');
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            });
        }

        // Add audit columns to cashflows table
        if (Schema::hasTable('cashflows') && !Schema::hasColumn('cashflows', 'created_by')) {
            Schema::table('cashflows', function (Blueprint $table) {
                $table->foreignId('created_by')->nullable()->after('type_cashflow')->constrained('users')->onDelete('set null');
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            });
        }

        // Add audit columns to user_accesses table if exists
        if (Schema::hasTable('user_accesses') && !Schema::hasColumn('user_accesses', 'created_by')) {
            Schema::table('user_accesses', function (Blueprint $table) {
                $table->foreignId('created_by')->nullable()->after('access')->constrained('users')->onDelete('set null');
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove audit columns from departments table
        if (Schema::hasTable('departments') && Schema::hasColumn('departments', 'created_by')) {
            Schema::table('departments', function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropForeign(['updated_by']);
                $table->dropColumn(['created_by', 'updated_by']);
            });
        }

        // Remove audit columns from jabatan table
        if (Schema::hasTable('jabatan') && Schema::hasColumn('jabatan', 'created_by')) {
            Schema::table('jabatan', function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropForeign(['updated_by']);
                $table->dropColumn(['created_by', 'updated_by']);
            });
        }

        // Remove audit columns from menus table
        if (Schema::hasTable('menus') && Schema::hasColumn('menus', 'created_by')) {
            Schema::table('menus', function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropForeign(['updated_by']);
                $table->dropColumn(['created_by', 'updated_by']);
            });
        }

        // Remove audit columns from cashflows table
        if (Schema::hasTable('cashflows') && Schema::hasColumn('cashflows', 'created_by')) {
            Schema::table('cashflows', function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropForeign(['updated_by']);
                $table->dropColumn(['created_by', 'updated_by']);
            });
        }

        // Remove audit columns from user_accesses table
        if (Schema::hasTable('user_accesses') && Schema::hasColumn('user_accesses', 'created_by')) {
            Schema::table('user_accesses', function (Blueprint $table) {
                $table->dropForeign(['created_by']);
                $table->dropForeign(['updated_by']);
                $table->dropColumn(['created_by', 'updated_by']);
            });
        }
    }
};
