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
            $table->string('link_meet')->nullable()->after('foto_kandidat')->comment('Link meeting untuk interview');
            $table->string('posisi_dilamar')->nullable()->after('link_meet')->comment('Posisi yang dilamar kandidat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment', function (Blueprint $table) {
            $table->dropColumn(['link_meet', 'posisi_dilamar']);
        });
    }
};
