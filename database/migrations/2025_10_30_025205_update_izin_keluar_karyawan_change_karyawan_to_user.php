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
        Schema::table('izin_keluar_karyawan', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['karyawan_id']);

            // Drop the old column
            $table->dropColumn('karyawan_id');

            // Add new user_id column with foreign key
            $table->foreignId('user_id')->after('id')->constrained('users')->onDelete('cascade');
        });

        // Update status enum to include 'sudah_kembali'
        DB::statement("ALTER TABLE izin_keluar_karyawan MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'sudah_kembali') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('izin_keluar_karyawan', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['user_id']);

            // Drop user_id column
            $table->dropColumn('user_id');

            // Add back karyawan_id column with foreign key
            $table->foreignId('karyawan_id')->after('id')->constrained('master_karyawan')->onDelete('cascade');
        });

        // Revert status enum back to original
        DB::statement("ALTER TABLE izin_keluar_karyawan MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    }
};
