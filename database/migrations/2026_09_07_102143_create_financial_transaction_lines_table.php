<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transaction_lines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_transaction_id')->constrained()->restrictOnDelete();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->enum('entry_type', ['debit', 'credit']);
            $table->decimal('amount_original', 20, 4);
            $table->unsignedBigInteger('amount_idr');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['financial_account_id', 'entry_type'], 'ft_lines_account_entry_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transaction_lines');
    }
};
