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
        Schema::create('recruitment', function (Blueprint $table) {
            $table->id();

            // Data Pribadi Kandidat
            $table->string('nik_paspor')->nullable()->comment('NIK atau Nomor Paspor');
            $table->string('nama_lengkap');
            $table->string('nama_panggilan')->nullable();
            $table->string('email')->unique();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->text('alamat')->nullable();

            // Data dalam bentuk JSON
            $table->json('sekolah')->nullable()->comment('Array of education history');
            $table->json('pengalaman_kerja')->nullable()->comment('Array of work experience');
            $table->json('skill')->nullable()->comment('Array of skills');
            $table->json('bahasa')->nullable()->comment('Array of languages');
            $table->text('sertifikat')->nullable()->comment('Certificates');

            // Interview Process
            $table->unsignedBigInteger('interview_hrd_by')->nullable()->comment('User ID who conducted HRD interview');
            $table->unsignedBigInteger('interview_user_by')->nullable()->comment('User ID who conducted User/Technical interview');

            // HRD Approval Process
            $table->unsignedBigInteger('accepted_hrd_by')->nullable();
            $table->timestamp('accepted_hrd_at')->nullable();
            $table->unsignedBigInteger('rejected_hrd_by')->nullable();
            $table->timestamp('rejected_hrd_at')->nullable();
            $table->text('reason_reject_hrd')->nullable();
            $table->text('review_hrd')->nullable()->comment('HRD review/notes');

            // User/Technical Approval Process
            $table->unsignedBigInteger('accepted_user_by')->nullable();
            $table->timestamp('accepted_user_at')->nullable();
            $table->unsignedBigInteger('rejected_user_by')->nullable();
            $table->timestamp('rejected_user_at')->nullable();
            $table->text('reason_reject_user')->nullable();
            $table->text('review_user')->nullable()->comment('User/Technical review/notes');

            // Offer Approval Process
            $table->unsignedBigInteger('accepted_offer_by')->nullable();
            $table->timestamp('accepted_offer_at')->nullable();
            $table->unsignedBigInteger('rejected_offer_by')->nullable();
            $table->timestamp('rejected_offer_at')->nullable();
            $table->text('reason_reject_offer')->nullable();

            // Status and Flags
            $table->string('status')->default('new')->comment('new, interview_hrd, interview_user, offering, accepted, rejected, hired');
            $table->boolean('is_blacklist')->default(false);
            $table->boolean('is_active')->default(true);

            // Audit Trail
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign Keys (optional - uncomment if you want to enforce foreign key constraints)
            // $table->foreign('interview_hrd_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('interview_user_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('accepted_hrd_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('rejected_hrd_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('accepted_user_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('rejected_user_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('accepted_offer_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('rejected_offer_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            // $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recruitment');
    }
};
