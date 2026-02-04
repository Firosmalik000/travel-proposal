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
            $table->string('cv_file')->nullable()->after('foto_kandidat');
            $table->string('link_portofolio')->nullable()->after('cv_file');
            $table->boolean('bersedia_luar_kota')->default(false)->after('link_portofolio');
            $table->string('instagram')->nullable()->after('bersedia_luar_kota');
            $table->string('tiktok')->nullable()->after('instagram');
            $table->string('facebook')->nullable()->after('tiktok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment', function (Blueprint $table) {
            $table->dropColumn([
                'cv_file',
                'link_portofolio',
                'bersedia_luar_kota',
                'instagram',
                'tiktok',
                'facebook',
            ]);
        });
    }
};
