<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table): void {
            $table->id();
            $table->string('transaction_number', 60)->unique();
            $table->date('transaction_date');
            $table->enum('transaction_type', ['opening_balance', 'manual_journal', 'transfer', 'legacy_unclassified', 'reversal']);
            $table->enum('status', ['draft', 'posted', 'reversed'])->default('draft');
            $table->nullableMorphs('source');
            $table->foreignId('package_id')->nullable()->constrained('packages')->restrictOnDelete();
            $table->char('currency', 3)->default('IDR');
            $table->decimal('exchange_rate', 20, 8)->default(1);
            $table->decimal('amount_original', 20, 4);
            $table->unsignedBigInteger('amount_idr');
            $table->string('idempotency_key', 150)->unique();
            $table->char('payload_hash', 64);
            $table->foreignId('reversal_of_id')->nullable()->unique()->constrained('financial_transactions')->restrictOnDelete();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->foreignId('reversed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reversed_at')->nullable();
            $table->timestamps();

            $table->index(['transaction_date', 'status']);
            $table->index(['transaction_type', 'status']);
            $table->index(['currency', 'transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
