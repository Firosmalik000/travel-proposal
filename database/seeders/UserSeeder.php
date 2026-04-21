<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'username' => 'admin',
                'name' => 'Administrator',
                'full_name' => 'Administrator Asfar Tour',
                'email' => 'admin@asfartour.co.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'operasional',
                'name' => 'Operasional',
                'full_name' => 'Tim Operasional Asfar Tour',
                'email' => 'operasional@asfartour.co.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'marketing',
                'name' => 'Marketing',
                'full_name' => 'Tim Marketing Asfar Tour',
                'email' => 'marketing@asfartour.co.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
            [
                'username' => 'admincs',
                'name' => 'Customer Care',
                'full_name' => 'Admin Customer Care',
                'email' => 'cs@asfartour.co.id',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($users as $row) {
            $user = User::query()->updateOrCreate(['email' => $row['email']], $row);

            UserProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $row['full_name'],
                    'phone' => '08137892647',
                    'address' => 'Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260',
                ],
            );
        }
    }
}
