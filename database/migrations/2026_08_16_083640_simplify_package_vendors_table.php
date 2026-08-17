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
        Schema::table('package_vendors', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropIndex(['is_active', 'name']);
            $table->dropColumn([
                'code',
                'contact_person',
                'email',
                'notes',
                'is_active',
            ]);

            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_vendors', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->string('code', 40)->nullable()->unique();
            $table->string('contact_person', 100)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->index(['is_active', 'name']);
        });
    }
};
