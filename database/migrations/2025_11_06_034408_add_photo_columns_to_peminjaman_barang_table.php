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
        Schema::table('peminjaman_barang', function (Blueprint $table) {
            $table->json('foto_pinjam')->nullable()->after('keterangan');
            $table->json('foto_kembali')->nullable()->after('foto_pinjam');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peminjaman_barang', function (Blueprint $table) {
            $table->dropColumn(['foto_pinjam', 'foto_kembali']);
        });
    }
};
