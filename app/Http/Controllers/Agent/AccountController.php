<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\UpdatePasswordRequest;
use App\Http\Requests\Agent\UpdateProfileRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function edit(): Response
    {
        $user = request()->user();
        $agent = $user->agentProfile;

        return Inertia::render('Agent/Account', ['profile' => [
            'name' => $user->name, 'email' => $user->email, 'phone' => $agent->phone, 'referral_code' => $agent->referral_code,
            'bank_name' => $agent->bank_name, 'bank_account_name' => $agent->bank_account_name, 'bank_account_number' => $agent->bank_account_number,
        ]]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $userData = $request->safe()->only(['name', 'email']);
        $userData['full_name'] = $userData['name'];
        $request->user()->update($userData);
        $request->user()->agentProfile->update($request->safe()->only(['phone', 'bank_name', 'bank_account_name', 'bank_account_number']));

        return back()->with('success', 'Profil dan rekening berhasil diperbarui.');
    }

    public function editPassword(): Response
    {
        return Inertia::render('Agent/Password');
    }

    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }
}
