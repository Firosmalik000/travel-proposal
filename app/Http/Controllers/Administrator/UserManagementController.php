<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\UpdateUserPasswordRequest;
use App\Http\Requests\Administrator\UpdateUserRequest;
use App\Http\Requests\Administrator\UpdateUserRoleRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        Role::query()->firstOrCreate(['name' => 'NoAccess', 'guard_name' => 'web']);

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $users = User::query()
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
                'is_super_admin' => $user->isSuperAdmin(),
            ]);

        return Inertia::render('Dashboard/Administrator/Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        if ($user->isSuperAdmin()) {
            return back()->withErrors(['user' => 'User super admin tidak bisa diubah rolenya.']);
        }

        /** @var int $roleId */
        $roleId = $request->validated('role_id');
        $role = Role::query()->findOrFail($roleId);

        $user->syncRoles([$role->name]);

        return back()->with('success', 'Role user berhasil diperbarui.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if ($user->isSuperAdmin()) {
            $user->update([
                'name' => $validated['name'],
            ]);

            return back()->with('success', 'User berhasil diperbarui.');
        }

        /** @var int $roleId */
        $roleId = $validated['role_id'];
        $role = Role::query()->findOrFail($roleId);

        $user->update([
            'name' => $validated['name'],
        ]);

        $user->syncRoles([$role->name]);

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function updatePassword(UpdateUserPasswordRequest $request, User $user): RedirectResponse
    {
        if ($user->isSuperAdmin()) {
            return back()->withErrors(['user' => 'Password super admin tidak bisa diubah dari sini.']);
        }

        $user->update([
            'password' => $request->validated('password'),
        ]);

        return back()->with('success', 'Password user berhasil diperbarui.');
    }
}
