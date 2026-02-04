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
        // Add is_active to inventaris table
        if (Schema::hasTable('inventaris') && !Schema::hasColumn('inventaris', 'is_active')) {
            Schema::table('inventaris', function (Blueprint $table) {
                $table->boolean('is_active')->default(1)->after('updated_by');
            });
        }

        // Add is_active to master_kendaraan_karyawan table
        if (Schema::hasTable('master_kendaraan_karyawan') && !Schema::hasColumn('master_kendaraan_karyawan', 'is_active')) {
            Schema::table('master_kendaraan_karyawan', function (Blueprint $table) {
                $table->boolean('is_active')->default(1)->after('cc');
            });
        }

        // Add is_active to cashflows table
        if (Schema::hasTable('cashflows') && !Schema::hasColumn('cashflows', 'is_active')) {
            Schema::table('cashflows', function (Blueprint $table) {
                $table->boolean('is_active')->default(1)->after('updated_by');
            });
        }

        // Add is_active to arsip_data_karyawan table
        if (Schema::hasTable('arsip_data_karyawan') && !Schema::hasColumn('arsip_data_karyawan', 'is_active')) {
            Schema::table('arsip_data_karyawan', function (Blueprint $table) {
                $table->boolean('is_active')->default(1)->after('updated_by');
            });
        }

        // Add is_active to slip_gaji table
        if (Schema::hasTable('slip_gaji') && !Schema::hasColumn('slip_gaji', 'is_active')) {
            Schema::table('slip_gaji', function (Blueprint $table) {
                $table->boolean('is_active')->default(1)->after('updated_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('inventaris', 'is_active')) {
            Schema::table('inventaris', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        if (Schema::hasColumn('master_kendaraan_karyawan', 'is_active')) {
            Schema::table('master_kendaraan_karyawan', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        if (Schema::hasColumn('cashflows', 'is_active')) {
            Schema::table('cashflows', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        if (Schema::hasColumn('arsip_data_karyawan', 'is_active')) {
            Schema::table('arsip_data_karyawan', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        if (Schema::hasColumn('slip_gaji', 'is_active')) {
            Schema::table('slip_gaji', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }
    }
};
