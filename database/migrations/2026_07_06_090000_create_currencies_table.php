<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name');
            $table->decimal('conversion_rate', 18, 6)->default(1);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->index(['code', 'is_active']);
        });

        $defaults = [
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah', 'conversion_rate' => 1, 'notes' => 'Default currency untuk Indonesia.'],
            ['code' => 'USD', 'name' => 'US Dollar', 'conversion_rate' => 1, 'notes' => 'Currency internasional yang paling umum digunakan.'],
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'conversion_rate' => 1, 'notes' => 'Sering dipakai untuk operasional di Arab Saudi.'],
            ['code' => 'EUR', 'name' => 'Euro', 'conversion_rate' => 1, 'notes' => 'Currency utama beberapa negara Eropa.'],
            ['code' => 'MYR', 'name' => 'Malaysian Ringgit', 'conversion_rate' => 1, 'notes' => 'Currency Malaysia.'],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'conversion_rate' => 1, 'notes' => 'Currency Singapura.'],
        ];

        foreach ($defaults as $currency) {
            DB::table('currencies')->updateOrInsert(
                ['code' => $currency['code']],
                [
                    'name' => $currency['name'],
                    'conversion_rate' => $currency['conversion_rate'],
                    'notes' => $currency['notes'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
