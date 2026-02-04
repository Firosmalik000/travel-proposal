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
        Schema::table('pinjaman_karyawan', function (Blueprint $table) {
            $table->enum('status', ['menunggu_persetujuan', 'disetujui', 'ditolak', 'dicairkan', 'selesai'])
                ->default('menunggu_persetujuan')
                ->after('id_privy')
                ->comment('Status pinjaman');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pinjaman_karyawan', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
