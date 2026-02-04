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
        Schema::create('slip_gaji', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Period
            $table->date('period_start')->comment('Tanggal awal periode');
            $table->date('period_end')->comment('Tanggal akhir periode');
            $table->string('period_label')->nullable()->comment('Label periode, e.g., "13-20 Oktober"');

            // Pendapatan (Income)
            $table->decimal('gaji_pokok', 15, 2)->default(0)->comment('Gaji pokok dari master_salary');
            $table->decimal('tunjangan', 15, 2)->default(0)->comment('Tunjangan dari master_salary');
            $table->decimal('bonus', 15, 2)->default(0)->comment('Bonus');
            $table->decimal('lembur', 15, 2)->default(0)->comment('Lembur');
            $table->decimal('pendapatan_lain', 15, 2)->default(0)->comment('Pendapatan lain-lain');
            $table->decimal('total_pendapatan', 15, 2)->default(0)->comment('Total semua pendapatan');

            // Potongan (Deductions)
            $table->decimal('potongan_konsumsi', 15, 2)->default(0)->comment('Potongan konsumsi siang');
            $table->decimal('potongan_kasbon', 15, 2)->default(0)->comment('Potongan kasbon');
            $table->decimal('potongan_lain', 15, 2)->default(0)->comment('Potongan lain-lain');
            $table->decimal('total_potongan', 15, 2)->default(0)->comment('Total semua potongan');

            // Net Salary
            $table->decimal('gaji_bersih', 15, 2)->default(0)->comment('Gaji bersih = total_pendapatan - total_potongan');
            $table->string('gaji_bersih_terbilang')->nullable()->comment('Terbilang gaji bersih');

            // Status
            $table->enum('status', ['draft', 'approved', 'sent'])->default('draft');

            // Audit trail
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('sent_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'period_start', 'period_end']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slip_gaji');
    }
};
