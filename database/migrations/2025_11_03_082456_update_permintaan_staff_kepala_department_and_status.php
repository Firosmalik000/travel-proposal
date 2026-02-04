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
        Schema::table('permintaan_staff', function (Blueprint $table) {
            // Drop old kepala_department column
            $table->dropColumn('kepala_department');
        });

        Schema::table('permintaan_staff', function (Blueprint $table) {
            // Add kepala_department_id as foreign key to master_karyawan
            $table->foreignId('kepala_department_id')->nullable()->after('department_id')->constrained('master_karyawan')->onDelete('set null');
        });

        // Update status_staff enum values
        \DB::statement("ALTER TABLE permintaan_staff MODIFY COLUMN status_staff ENUM('probation', 'kontrak', 'tetap', 'freelance', 'magang') DEFAULT 'kontrak'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permintaan_staff', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign(['kepala_department_id']);
            $table->dropColumn('kepala_department_id');
        });

        Schema::table('permintaan_staff', function (Blueprint $table) {
            // Re-add kepala_department as string
            $table->string('kepala_department')->nullable()->after('department_id');
        });

        // Revert status_staff enum values
        \DB::statement("ALTER TABLE permintaan_staff MODIFY COLUMN status_staff ENUM('Kontrak', 'Tetap', 'Freelance', 'Magang') DEFAULT 'Kontrak'");
    }
};
