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
        // First, convert existing single attachments to JSON format
        DB::statement("UPDATE cashflows SET attachment = JSON_ARRAY(attachment) WHERE attachment IS NOT NULL AND attachment != ''");

        // Then change column type to JSON
        Schema::table('cashflows', function (Blueprint $table) {
            $table->json('attachment')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert JSON back to first element (single attachment)
        DB::statement("UPDATE cashflows SET attachment = JSON_UNQUOTE(JSON_EXTRACT(attachment, '$[0]')) WHERE attachment IS NOT NULL");

        // Change column back to string
        Schema::table('cashflows', function (Blueprint $table) {
            $table->string('attachment')->nullable()->change();
        });
    }
};
