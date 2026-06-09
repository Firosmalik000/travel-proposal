<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_participants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('gender', 20)->nullable();
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('marital_status', 20)->nullable();
            $table->text('address')->nullable();
            $table->boolean('needs_wheelchair')->default(false);
            $table->string('shirt_size', 10)->nullable();
            $table->boolean('passport_ready')->default(false);
            $table->date('passport_issue_date')->nullable();
            $table->date('passport_expiry_date')->nullable();
            $table->string('passport_type', 30)->nullable();
            $table->unsignedTinyInteger('passport_validity_years')->nullable();
            $table->string('passport_scan_path')->nullable();
            $table->string('family_card_scan_path')->nullable();
            $table->string('marriage_book_scan_path')->nullable();
            $table->string('birth_certificate_scan_path')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('meningitis_vaccine_scan_path')->nullable();
            $table->boolean('has_medical_history')->default(false);
            $table->text('medical_history_notes')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->boolean('has_performed_umrah')->default(false);
            $table->string('referral_source')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_participants');
    }
};
