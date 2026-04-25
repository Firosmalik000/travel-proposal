<?php

namespace App\Console\Commands;

use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    protected $signature = 'admin:reset-password
                            {email? : Email admin (default: admin@asfartour.co.id)}
                            {--password=password : Password baru}';

    protected $description = 'Reset password dan grant semua permission ke akun admin';

    private const ALL_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];

    public function handle(): int
    {
        // Auto-seed jika DB kosong
        if (Menu::query()->count() === 0) {
            $this->call(\Database\Seeders\DatabaseSeeder::class);
            $this->info('Database di-seed ulang.');

            return self::SUCCESS;
        }

        $email = $this->argument('email') ?? 'admin@asfartour.co.id';
        $password = $this->option('password');

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $user = User::query()->create([
                'username' => explode('@', $email)[0],
                'name' => 'Administrator',
                'full_name' => 'Administrator Asfar Tour',
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make($password),
            ]);
            $this->info("User {$email} dibuat.");
        } else {
            $user->update(['password' => Hash::make($password)]);
            $this->info("Password {$email} direset.");
        }

        $menuKeys = Menu::query()
            ->orderBy('order')
            ->get()
            ->flatMap(fn (Menu $menu): array => $menu->getAllMenuKeys())
            ->filter()
            ->unique()
            ->values()
            ->all();

        $access = array_fill_keys($menuKeys, self::ALL_PERMISSIONS);

        UserAccess::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['access' => $access],
        );

        $this->info('Semua permission ('.count($access).' menu) diberikan ke '.$email);
        $this->line("Login: {$email} / {$password}");

        return self::SUCCESS;
    }
}
