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
        Schema::table('cashflows', function (Blueprint $table) {
            // Running balance: saldo berjalan setelah transaksi ini
            $table->decimal('running_balance', 15, 2)->nullable()->after('amount');

            // Reference ID: untuk link ke dokumen lain (invoice, PO, dll)
            $table->string('reference_id', 100)->nullable()->after('description')->index();

            // Reference type: tipe referensi (invoice, purchase_order, receipt, etc)
            $table->string('reference_type', 50)->nullable()->after('reference_id');

            // Approved by: user yang approve transaksi ini (untuk workflow)
            $table->foreignId('approved_by')->nullable()->after('updated_by')->constrained('users')->nullOnDelete();

            // Approved at: waktu approval
            $table->timestamp('approved_at')->nullable()->after('approved_by');

            // Status: untuk workflow approval (pending, approved, rejected)
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->after('is_active');

            // Rejection reason: alasan jika rejected
            $table->text('rejection_reason')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cashflows', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'running_balance',
                'reference_id',
                'reference_type',
                'approved_by',
                'approved_at',
                'status',
                'rejection_reason',
            ]);
        });
    }
};
