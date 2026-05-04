<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\InviteUserRequest;
use App\Mail\UserInvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class InvitationController extends Controller
{
    public function store(InviteUserRequest $request): RedirectResponse
    {
        $email = Str::lower($request->validated('email'));

        if (User::query()->where('email', $email)->exists()) {
            return back()->withErrors(['email' => 'Email tersebut sudah terdaftar.']);
        }

        $token = Str::random(64);
        $tokenHash = hash('sha256', $token);

        $invitation = Invitation::query()->updateOrCreate(
            ['email' => $email],
            [
                'token_hash' => $tokenHash,
                'invited_by_user_id' => $request->user()?->id,
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
            ],
        );

        $acceptUrl = route('invitations.show', ['token' => $token]);

        try {
            Mail::to($invitation->email)->send(new UserInvitationMail($acceptUrl));
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'email' => 'Gagal mengirim undangan. Periksa konfigurasi email (MAIL_*) lalu coba lagi.',
            ]);
        }

        return back()->with('success', 'Undangan berhasil dikirim.');
    }
}
