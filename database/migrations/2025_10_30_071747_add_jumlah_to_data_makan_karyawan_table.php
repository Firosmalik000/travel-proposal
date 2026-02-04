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
        Schema::table('data_makan_karyawan', function (Blueprint $table) {
            $table->integer('jumlah')->default(1)->after('tanggal')->comment('Jumlah porsi makan (pax)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_makan_karyawan', function (Blueprint $table) {
            $table->dropColumn('jumlah');
        });
    }
};
