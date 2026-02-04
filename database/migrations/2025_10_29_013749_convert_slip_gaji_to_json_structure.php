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
        // Step 1: Add new JSON columns
        Schema::table('slip_gaji', function (Blueprint $table) {
            $table->json('pendapatan')->nullable()->after('period_label');
            $table->json('potongan')->nullable()->after('pendapatan');
        });

        // Step 2: Migrate existing data to JSON format
        DB::table('slip_gaji')->get()->each(function ($slip) {
            $pendapatan = [
                ['label' => 'Gaji Pokok', 'amount' => $slip->gaji_pokok],
                ['label' => 'Tunjangan', 'amount' => $slip->tunjangan],
                ['label' => 'Bonus', 'amount' => $slip->bonus],
                ['label' => 'Lembur', 'amount' => $slip->lembur],
                ['label' => 'Lain-lain', 'amount' => $slip->pendapatan_lain],
            ];

            $potongan = [
                ['label' => 'Konsumsi Siang', 'amount' => $slip->potongan_konsumsi],
                ['label' => 'Kasbon', 'amount' => $slip->potongan_kasbon],
                ['label' => 'Lain-lain', 'amount' => $slip->potongan_lain],
            ];

            DB::table('slip_gaji')
                ->where('id', $slip->id)
                ->update([
                    'pendapatan' => json_encode($pendapatan),
                    'potongan' => json_encode($potongan),
                ]);
        });

        // Step 3: Drop old columns
        Schema::table('slip_gaji', function (Blueprint $table) {
            $table->dropColumn([
                'gaji_pokok',
                'tunjangan',
                'bonus',
                'lembur',
                'pendapatan_lain',
                'potongan_konsumsi',
                'potongan_kasbon',
                'potongan_lain',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Add back old columns
        Schema::table('slip_gaji', function (Blueprint $table) {
            $table->decimal('gaji_pokok', 15, 2)->default(0)->after('period_label');
            $table->decimal('tunjangan', 15, 2)->default(0)->after('gaji_pokok');
            $table->decimal('bonus', 15, 2)->default(0)->after('tunjangan');
            $table->decimal('lembur', 15, 2)->default(0)->after('bonus');
            $table->decimal('pendapatan_lain', 15, 2)->default(0)->after('lembur');
            $table->decimal('potongan_konsumsi', 15, 2)->default(0)->after('total_pendapatan');
            $table->decimal('potongan_kasbon', 15, 2)->default(0)->after('potongan_konsumsi');
            $table->decimal('potongan_lain', 15, 2)->default(0)->after('potongan_kasbon');
        });

        // Step 2: Migrate data back from JSON
        DB::table('slip_gaji')->get()->each(function ($slip) {
            $pendapatan = json_decode($slip->pendapatan, true) ?? [];
            $potongan = json_decode($slip->potongan, true) ?? [];

            $update = [
                'gaji_pokok' => 0,
                'tunjangan' => 0,
                'bonus' => 0,
                'lembur' => 0,
                'pendapatan_lain' => 0,
                'potongan_konsumsi' => 0,
                'potongan_kasbon' => 0,
                'potongan_lain' => 0,
            ];

            // Map pendapatan back
            foreach ($pendapatan as $item) {
                switch ($item['label']) {
                    case 'Gaji Pokok':
                        $update['gaji_pokok'] = $item['amount'];
                        break;
                    case 'Tunjangan':
                        $update['tunjangan'] = $item['amount'];
                        break;
                    case 'Bonus':
                        $update['bonus'] = $item['amount'];
                        break;
                    case 'Lembur':
                        $update['lembur'] = $item['amount'];
                        break;
                    case 'Lain-lain':
                        $update['pendapatan_lain'] = $item['amount'];
                        break;
                }
            }

            // Map potongan back
            foreach ($potongan as $item) {
                switch ($item['label']) {
                    case 'Konsumsi Siang':
                        $update['potongan_konsumsi'] = $item['amount'];
                        break;
                    case 'Kasbon':
                        $update['potongan_kasbon'] = $item['amount'];
                        break;
                    case 'Lain-lain':
                        $update['potongan_lain'] = $item['amount'];
                        break;
                }
            }

            DB::table('slip_gaji')
                ->where('id', $slip->id)
                ->update($update);
        });

        // Step 3: Drop JSON columns
        Schema::table('slip_gaji', function (Blueprint $table) {
            $table->dropColumn(['pendapatan', 'potongan']);
        });
    }
};
