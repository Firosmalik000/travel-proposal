<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ImpersonationController extends Controller
{
    public function start(Request $request, User $user): Response
    {
        /** @var User $actor */
        $actor = $request->user();

        if (! $actor->can('menu.user_management.edit')) {
            abort(403, 'Kamu tidak punya izin untuk impersonate user.');
        }

        if ($actor->id === $user->id) {
            return back()->withErrors(['impersonate' => 'Tidak bisa impersonate diri sendiri.']);
        }

        if ($user->isSuperAdmin()) {
            return back()->withErrors(['impersonate' => 'Tidak bisa impersonate user Super Admin.']);
        }

        Auth::login($user);

        // Ensure impersonator flag persists even if the session is regenerated after login.
        $request->session()->put('impersonator_id', $actor->id);
        $request->session()->save();

        if ($request->header('X-Inertia')) {
            return Inertia::location('/dashboard');
        }

        return redirect('/dashboard')->with('success', 'Berhasil impersonate user: '.$user->email);
    }

    public function stop(Request $request): Response
    {
        /** @var int|null $impersonatorId */
        $impersonatorId = $request->session()->get('impersonator_id');

        if (! $impersonatorId) {
            if ($request->header('X-Inertia')) {
                return Inertia::location('/admin');
            }

            return redirect('/admin');
        }

        $request->session()->forget('impersonator_id');
        $request->session()->save();

        $impersonator = User::query()->find($impersonatorId);
        if (! $impersonator) {
            Auth::logout();

            return redirect('/login');
        }

        Auth::login($impersonator);
        $request->session()->save();

        if ($request->header('X-Inertia')) {
            return Inertia::location('/admin');
        }

        return redirect('/admin')->with('success', 'Kembali ke akun asli.');
    }
}
