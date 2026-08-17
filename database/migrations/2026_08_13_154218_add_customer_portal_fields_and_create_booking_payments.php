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
        Schema::table('package_registrations', function (Blueprint $table): void {
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        Schema::table('custom_umroh_requests', function (Blueprint $table): void {
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        Schema::table('bookings', function (Blueprint $table): void {
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('agreed_total_amount')->nullable()->after('custom_currency');
            $table->string('agreed_currency', 3)->nullable()->after('agreed_total_amount');
            $table->timestamp('participant_data_locked_at')->nullable()->after('status');
            $table->index(['customer_id', 'status']);
        });

        Schema::create('booking_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->date('payment_date');
            $table->unsignedBigInteger('amount');
            $table->string('payment_method', 50);
            $table->string('reference_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['confirmed', 'void'])->default('confirmed');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['booking_id', 'status', 'payment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_payments');

        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropIndex(['customer_id', 'status']);
            $table->dropConstrainedForeignId('customer_id');
            $table->dropColumn(['agreed_total_amount', 'agreed_currency', 'participant_data_locked_at']);
        });

        Schema::table('custom_umroh_requests', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('customer_id');
        });

        Schema::table('package_registrations', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('customer_id');
        });
    }
};
