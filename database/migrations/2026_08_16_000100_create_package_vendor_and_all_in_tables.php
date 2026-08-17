<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_vendors', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('name', 150);
            $table->string('contact_person', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'name']);
        });

        Schema::create('vendor_price_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_vendor_id')->constrained('package_vendors')->cascadeOnDelete();
            $table->string('label', 100);
            $table->date('start_date');
            $table->date('end_date');
            $table->char('currency', 3)->default('IDR');
            $table->decimal('price_per_pax', 18, 2);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['package_vendor_id', 'is_active']);
            $table->index(['start_date', 'end_date']);
        });

        Schema::create('package_all_in_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->unique()->constrained('packages')->cascadeOnDelete();
            $table->foreignId('package_vendor_id')->constrained('package_vendors')->restrictOnDelete();
            $table->foreignId('vendor_price_period_id')->constrained('vendor_price_periods')->restrictOnDelete();
            $table->string('broker_package_name', 150);
            $table->char('currency', 3);
            $table->decimal('price_per_pax', 18, 2);
            $table->json('included_category_keys');
            $table->string('vendor_name_snapshot', 150);
            $table->string('period_label_snapshot', 100);
            $table->date('period_start_snapshot');
            $table->date('period_end_snapshot');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['package_vendor_id', 'vendor_price_period_id'], 'package_all_in_vendor_period_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_all_in_configs');
        Schema::dropIfExists('vendor_price_periods');
        Schema::dropIfExists('package_vendors');
    }
};
