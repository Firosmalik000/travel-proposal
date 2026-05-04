<?php

namespace App\Console\Commands;

use App\Models\Menu;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

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

        MenuPermissionService::ensurePermissionsExist();

        $permissionNames = [];
        foreach ($menuKeys as $menuKey) {
            foreach (self::ALL_PERMISSIONS as $action) {
                $permissionNames[] = MenuPermissionService::permissionName((string) $menuKey, (string) $action);
            }
        }

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn('name', $permissionNames)
            ->get();

        $user->syncPermissions($permissions);

        $this->info('Semua permission ('.count($menuKeys).' menu) diberikan ke '.$email);
        $this->line("Login: {$email} / {$password}");

        return self::SUCCESS;
    }
}
