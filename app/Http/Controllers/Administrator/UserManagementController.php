<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Customer\ResolveCustomerAccount;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\UpdateUserPasswordRequest;
use App\Http\Requests\Administrator\UpdateUserRequest;
use App\Http\Requests\Administrator\UpdateUserRoleRequest;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function __construct(private readonly ResolveCustomerAccount $resolveCustomerAccount) {}

    public function index(): Response
    {
        Role::query()->firstOrCreate(['name' => 'NoAccess', 'guard_name' => 'web']);

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $users = User::query()
            ->with(['roles:id,name', 'profile:user_id,full_name,phone,gender,birth_place,birth_date,address'])
            ->withCount('customerBookings')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'full_name'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'full_name' => $user->profile?->full_name ?? $user->full_name,
                'phone' => $user->profile?->phone,
                'gender' => $user->profile?->gender,
                'birth_place' => $user->profile?->birth_place,
                'birth_date' => $user->profile?->birth_date?->format('Y-m-d'),
                'address' => $user->profile?->address,
                'avatar' => $user->avatar,
                'role' => $user->roles->first(fn (Role $role): bool => $role->name !== 'Customer')?->name
                    ?? $user->roles->first()?->name,
                'roles' => $user->roles->pluck('name')->values()->all(),
                'booking_count' => (int) $user->customer_bookings_count,
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

        $this->syncManagedRole($user, $role->name);

        return back()->with('success', 'Role user berhasil diperbarui.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $profile = UserProfile::query()->firstOrNew(['user_id' => $user->id]);

        if ($user->isSuperAdmin()) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'full_name' => $validated['full_name'] ?: $validated['name'],
            ]);

            $profile->fill([
                'full_name' => $validated['full_name'] ?: $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'birth_place' => $validated['birth_place'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);
            $profile->user()->associate($user);
            $profile->save();

            return back()->with('success', 'User berhasil diperbarui.');
        }

        /** @var int $roleId */
        $roleId = $validated['role_id'];
        $role = Role::query()->findOrFail($roleId);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'full_name' => $validated['full_name'] ?: $validated['name'],
        ]);

        $this->syncManagedRole($user, $role->name);

        $profile->fill([
            'full_name' => $validated['full_name'] ?: $validated['name'],
            'phone' => filled($validated['phone'] ?? null)
                ? $this->resolveCustomerAccount->normalizePhone($validated['phone'])
                : null,
            'gender' => $validated['gender'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);
        $profile->user()->associate($user);
        $profile->save();

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

    private function syncManagedRole(User $user, string $roleName): void
    {
        $roles = [$roleName];

        if ($user->customerBookings()->exists() && $roleName !== 'Customer') {
            $roles[] = 'Customer';
        }

        $user->syncRoles($roles);
    }
}
