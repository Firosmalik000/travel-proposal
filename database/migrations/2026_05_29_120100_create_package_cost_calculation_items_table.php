<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_cost_calculation_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_cost_calculation_id')
                ->constrained('package_cost_calculations', indexName: 'pcc_items_calc_id_fk')
                ->cascadeOnDelete();
            $table->string('cost_type', 30);
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('label');
            $table->text('description')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('unit_price')->default(0);
            $table->unsignedBigInteger('total_price')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_cost_calculation_items');
    }
};
