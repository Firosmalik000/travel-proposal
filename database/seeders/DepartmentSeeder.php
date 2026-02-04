<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'code' => 'HR',
                'name' => 'HRD',
                'description' => 'Human Resource Development',
                'is_active' => true,
            ],
            [
                'code' => 'SLS',
                'name' => 'Sales',
                'description' => 'Sales Department',
                'is_active' => true,
            ],
            [
                'code' => 'IT',
                'name' => 'IT Programmer',
                'description' => 'Information Technology & Programming',
                'is_active' => true,
            ],
            [
                'code' => 'ECO',
                'name' => 'Ecomerce',
                'description' => 'E-commerce Department',
                'is_active' => true,
            ],
            [
                'code' => 'CR',
                'name' => 'Creative',
                'description' => 'Creative Department',
                'is_active' => true,
            ],
            [
                'code' => 'MGT',
                'name' => 'Management',
                'description' => 'Management Department',
                'is_active' => true,
            ],
            [
                'code' => 'TLN',
                'name' => 'Talent',
                'description' => 'Talent Management',
                'is_active' => true,
            ],
            [
                'code' => 'SSM',
                'name' => 'Sosial Media',
                'description' => 'Social Media Department',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['code' => $department['code']],
                $department
            );
        }

        $this->command->info('✓ Departments seeded successfully!');
        $this->command->info('  - Total departments: ' . count($departments));
    }
}
