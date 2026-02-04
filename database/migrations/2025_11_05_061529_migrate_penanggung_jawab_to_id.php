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
        // Migrate data from penanggung_jawab (string name) to penanggung_jawab_id (foreign key)
        $inventaris = DB::table('inventaris')->whereNotNull('penanggung_jawab')->get();

        foreach ($inventaris as $item) {
            // Try to find user by username matching penanggung_jawab
            $user = DB::table('users')
                ->where('username', $item->penanggung_jawab)
                ->orWhere('name', $item->penanggung_jawab)
                ->first();

            if ($user) {
                DB::table('inventaris')
                    ->where('id', $item->id)
                    ->update(['penanggung_jawab_id' => $user->id]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset penanggung_jawab_id to null
        DB::table('inventaris')->update(['penanggung_jawab_id' => null]);
    }
};
