<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, convert existing string values to JSON array format
        DB::statement("UPDATE inventaris SET foto_barang = JSON_ARRAY(foto_barang) WHERE foto_barang IS NOT NULL AND foto_barang != ''");

        // Set empty strings to NULL
        DB::statement("UPDATE inventaris SET foto_barang = NULL WHERE foto_barang = ''");

        Schema::table('inventaris', function (Blueprint $table) {
            // Change foto_barang from string to json
            $table->json('foto_barang')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventaris', function (Blueprint $table) {
            // Revert back to string
            $table->string('foto_barang')->nullable()->change();
        });
    }
};
