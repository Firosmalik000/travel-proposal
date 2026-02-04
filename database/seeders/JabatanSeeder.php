<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jabatan = [
            [
                'name' => 'Staff',
                'department_id' => 1, // HR
                'is_active' => true,
            ],
            [
                'name' => 'Staff',
                'department_id' => 3, // IT
                'is_active' => true,
            ],
            [
                'name' => 'Staff',
                'department_id' => 4, // ECO
                'is_active' => true,
            ],
            [
                'name' => 'Supervisor',
                'department_id' => 4, // ECO
                'is_active' => true,
            ],
            [
                'name' => 'Staff',
                'department_id' => 5, // CR
                'is_active' => true,
            ],
            [
                'name' => 'Staff',
                'department_id' => 7, // TLN
                'is_active' => true,
            ],
            [
                'name' => 'Staff',
                'department_id' => 8, // SSM
                'is_active' => true,
            ],
            [
                'name' => 'Komisaris',
                'department_id' => 6, // MGT
                'is_active' => true,
            ],
        ];

        foreach ($jabatan as $jab) {
            Jabatan::updateOrCreate(
                [
                    'name' => $jab['name'],
                    'department_id' => $jab['department_id']
                ],
                $jab
            );
        }

        $this->command->info('✓ Jabatan seeded successfully!');
        $this->command->info('  - Total jabatan: ' . count($jabatan));
    }
}
