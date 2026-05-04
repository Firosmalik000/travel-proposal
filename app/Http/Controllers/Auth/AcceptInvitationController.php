<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AcceptInvitationRequest;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AcceptInvitationController extends Controller
{
    public function show(string $token): Response
    {
        $invitation = $this->findValidInvitation($token);

        return Inertia::render('auth/accept-invitation', [
            'email' => $invitation->email,
            'token' => $token,
        ]);
    }

    public function store(AcceptInvitationRequest $request, string $token): RedirectResponse
    {
        $invitation = $this->findValidInvitation($token);
        $validated = $request->validated();

        DB::transaction(function () use ($invitation, $validated) {
            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => Str::lower($invitation->email),
                'password' => $validated['password'],
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();

            $noAccessRole = Role::query()->firstOrCreate(['name' => 'NoAccess', 'guard_name' => 'web']);

            $user->assignRole($noAccessRole);

            $invitation->forceFill([
                'accepted_at' => now(),
            ])->save();
        });

        return redirect()
            ->route('login')
            ->with('status', 'Akun berhasil dibuat. Silakan login, lalu minta admin memberikan akses sesuai role.');
    }

    private function findValidInvitation(string $token): Invitation
    {
        $tokenHash = hash('sha256', $token);

        return Invitation::query()
            ->where('token_hash', $tokenHash)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();
    }
}
