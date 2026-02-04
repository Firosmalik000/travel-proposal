<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'username' => 'admin',
                'name' => 'Administrator',
                'full_name' => 'Administrator',
                'email' => 'admin@xboss.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'amad',
                'name' => 'Muhammad Aziiz Putra Nugroho',
                'full_name' => 'Muhammad Aziiz Putra Nugroho',
                'email' => 'aziiz@xboss.asia',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'asiyah',
                'name' => 'Asiyah',
                'full_name' => 'Asiyah',
                'email' => 'asiyah@xboss.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'Chika',
                'name' => 'Fajar Rifaldi',
                'full_name' => 'Fajar Rifaldi',
                'email' => 'fajarrifaldi@xboss.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'firos123',
                'name' => 'Firos Malik Abdillah',
                'full_name' => 'Firos Malik Abdillah',
                'email' => 'Firosmalik.job@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }

        $this->command->info('✓ Users seeded successfully!');
        $this->command->info('  - Total users: ' . count($users));
        $this->command->info('  - Default password: password');
    }
}
