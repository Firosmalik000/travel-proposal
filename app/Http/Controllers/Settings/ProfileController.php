<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Requests\Settings\UpdateAccountProfileRequest;
use App\Http\Requests\Settings\UpdatePersonalProfileRequest;
use App\Models\UserProfile;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profile');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $user->profile,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->safe()->only(['name', 'email']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function updatePersonalInfo(UpdatePersonalProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $profile = UserProfile::query()->firstOrNew(['user_id' => $user->id]);
        $validated = $request->validated();

        $payload = [
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'address' => $validated['address'] ?? null,
        ];

        if ($request->hasFile('photo')) {
            if ($profile->photo_path) {
                Storage::disk('public')->delete($profile->photo_path);
            }

            $payload['photo_path'] = $request->file('photo')->store('profiles', 'public');
        }

        $profile->fill($payload);
        $profile->user()->associate($user);
        $profile->save();

        if (! $user->full_name && $profile->full_name) {
            $user->forceFill(['full_name' => $profile->full_name])->save();
        }

        return back()->with('success', 'Informasi pribadi berhasil diperbarui');
    }

    public function updateAccount(UpdateAccountProfileRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $user->name = $validated['name'];

        if ($user->email !== $validated['email']) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Informasi akun berhasil diperbarui');
    }
}
