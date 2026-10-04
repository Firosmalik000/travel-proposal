<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['vendor_bills', 'vendor_bill_payments'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                if (! Schema::hasColumn($table->getTable(), 'created_by')) {
                    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn($table->getTable(), 'updated_by')) {
                    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['vendor_bills', 'vendor_bill_payments'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropConstrainedForeignId('created_by');
                $table->dropConstrainedForeignId('updated_by');
            });
        }
    }
};
