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
        Schema::create('pinjaman_karyawan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('ID karyawan yang mengajukan pinjaman');
            $table->decimal('nominal', 15, 2)->comment('Nominal pinjaman');
            $table->string('file_scorelife')->nullable()->comment('File scorelife');
            $table->string('id_privy')->nullable()->comment('ID Privy');

            // Approval fields
            $table->boolean('is_approve')->default(false)->comment('Status approve');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->comment('Diapprove oleh');
            $table->timestamp('approved_at')->nullable()->comment('Tanggal approve');

            // Rejection fields
            $table->boolean('is_rejected')->default(false)->comment('Status reject');
            $table->foreignId('rejected_by')->nullable()->constrained('users')->onDelete('set null')->comment('Direject oleh');
            $table->timestamp('rejected_at')->nullable()->comment('Tanggal reject');
            $table->text('reason_reject')->nullable()->comment('Alasan reject');

            // Soft deletes and active status
            $table->boolean('is_active')->default(true)->comment('Status aktif');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pinjaman_karyawan');
    }
};
