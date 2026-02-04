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
            $table->date('tgl_interview')->nullable()->after('link_portofolio');
            $table->enum('status_interview', ['Offline', 'Online'])->nullable()->after('tgl_interview');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment', function (Blueprint $table) {
            $table->dropColumn(['tgl_interview', 'status_interview']);
        });
    }
};
