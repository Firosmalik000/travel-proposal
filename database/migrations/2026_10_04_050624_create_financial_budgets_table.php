<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_budgets', function (Blueprint $table): void {
            $table->id();
            $table->string('budget_number', 40)->unique();
            $table->string('name', 150);
            $table->foreignId('package_id')->nullable()->constrained('packages')->restrictOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['draft', 'approved', 'closed'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'period_start', 'period_end']);
            $table->index(['package_id', 'status']);
        });

        Schema::create('financial_budget_lines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('financial_budget_id')->constrained()->cascadeOnDelete();
            $table->foreignId('financial_account_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('planned_amount_idr');
            $table->string('notes', 500)->nullable();
            $table->timestamps();

            $table->unique(['financial_budget_id', 'financial_account_id'], 'financial_budget_account_unique');
            $table->index('financial_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::table('financial_budgets')->exists()) {
            throw new RuntimeException('Anggaran keuangan sudah memiliki data dan tidak dapat di-rollback.');
        }

        Schema::dropIfExists('financial_budget_lines');
        Schema::dropIfExists('financial_budgets');
    }
};
