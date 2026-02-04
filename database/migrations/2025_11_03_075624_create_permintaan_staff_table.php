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
        Schema::create('permintaan_staff', function (Blueprint $table) {
            $table->id();

            // Department Information
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->string('kepala_department')->nullable();

            // Position Information
            $table->string('posisi');
            $table->enum('status_staff', ['Kontrak', 'Tetap', 'Freelance', 'Magang'])->default('Kontrak');

            // Qualifications
            $table->text('kualifikasi')->nullable()->comment('Kualifikasi pendidikan dan sertifikasi');
            $table->text('pengalaman')->nullable()->comment('Pengalaman kerja yang dibutuhkan');
            $table->text('skill_teknis')->nullable()->comment('Skill teknis yang dibutuhkan');
            $table->text('soft_skill')->nullable()->comment('Soft skill yang dibutuhkan');
            $table->text('bahasa')->nullable()->comment('Kemampuan bahasa yang dibutuhkan');

            // Timeline
            $table->date('target_tgl_posting')->nullable()->comment('Target tanggal posting iklan');
            $table->date('target_on_boarding')->nullable()->comment('Target tanggal on boarding staff baru');
            $table->date('deadline_hiring')->nullable()->comment('Deadline proses hiring');

            // Job Posting
            $table->string('url_iklan_glints')->nullable()->comment('URL iklan lowongan di Glints atau platform lain');

            // Additional Notes
            $table->text('catatan')->nullable();

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'in_progress', 'completed'])->default('pending');
            $table->boolean('is_active')->default(true);

            // Audit Fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permintaan_staff');
    }
};
