<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::statement("
            UPDATE menus
            SET children = REPLACE(children, '\"name\": \"Portal Content\"', '\"name\": \"Policy & Help\"'),
                updated_at = NOW()
            WHERE menu_key = 'website_management'
        ");
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::statement("
            UPDATE menus
            SET children = REPLACE(children, '\"name\": \"Policy & Help\"', '\"name\": \"Portal Content\"'),
                updated_at = NOW()
            WHERE menu_key = 'website_management'
        ");
    }
};
