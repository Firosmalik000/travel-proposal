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
        Schema::table('recruitment', function (Blueprint $table) {
            $table->string('kewarganegaraan')->nullable()->after('tanggal_lahir');
            $table->string('status_pernikahan')->nullable()->after('kewarganegaraan');
            $table->string('agama')->nullable()->after('status_pernikahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment', function (Blueprint $table) {
            $table->dropColumn(['kewarganegaraan', 'status_pernikahan', 'agama']);
        });
    }
};
