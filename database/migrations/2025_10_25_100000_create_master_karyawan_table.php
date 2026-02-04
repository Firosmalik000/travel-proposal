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
        Schema::create('master_karyawan', function (Blueprint $table) {
            $table->id();

            // Relasi
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Informasi Pribadi
            $table->string('nik')->unique();
            $table->string('nama_lengkap');
            $table->string('nama_panggilan')->nullable();
            $table->enum('gender', ['L', 'P']); // L = Laki-laki, P = Perempuan
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->text('alamat')->nullable();
            $table->string('agama')->nullable();
            $table->enum('status_pernikahan', ['Belum Menikah', 'Menikah', 'Cerai'])->nullable();
            $table->string('email')->unique();
            $table->string('foto')->nullable();

            // Informasi Karyawan
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('jabatan_id')->nullable()->constrained('jabatan')->onDelete('set null');
            $table->date('tanggal_mulai_bekerja');
            $table->enum('status_karyawan', ['probation', 'kontrak', 'tetap'])->default('probation');

            // Audit Fields
            $table->boolean('is_active')->default(true);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_karyawan');
    }
};
