<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('testimonials', 'photos')) {
            return;
        }

        Schema::table('testimonials', function (Blueprint $table) {
            $table->json('photos')->nullable()->after('quote');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('testimonials', 'photos')) {
            return;
        }

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropColumn('photos');
        });
    }
};
