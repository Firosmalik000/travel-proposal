<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cashflows', function (Blueprint $table): void {
            $table->id();
            $table->date('transaction_date');
            $table->enum('type', ['income', 'expense']);
            $table->unsignedBigInteger('amount');
            $table->string('category');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->index(['transaction_date', 'type']);
            $table->index('category');
        });

        Schema::create('cashflow_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cashflow_id')->constrained('cashflows')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedInteger('file_size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cashflow_attachments');
        Schema::dropIfExists('cashflows');
    }
};
