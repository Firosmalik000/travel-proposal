<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\KendaraanKaryawan;
use App\Models\MasterKaryawan;
use App\Traits\HasMinioUpload;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use HasMinioUpload;
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $karyawan = MasterKaryawan::where('user_id', $user->id)
            ->with(['department', 'jabatan'])
            ->first();

        // Get kendaraan data
        $kendaraan = KendaraanKaryawan::where('user_id', $user->id)->get();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'karyawan' => $karyawan,
            'kendaraan' => $kendaraan,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Update User model (account data)
        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }
            $user->email = $validated['email'];
        }

        $user->save();

        // Update MasterKaryawan model (personal data)
        $karyawan = MasterKaryawan::where('user_id', $user->id)->first();

        if ($karyawan) {
            $karyawanData = [];

            // Handle foto upload to MinIO
            if ($request->hasFile('foto')) {
                $newPath = $this->replaceFileInMinio(
                    $request->file('foto'),
                    $karyawan->foto,
                    'karyawan-photos',
                    'karyawan'
                );

                if ($newPath) {
                    $karyawanData['foto'] = $newPath;
                }
            }

            // Also update email in master_karyawan to keep data in sync
            if (isset($validated['email'])) $karyawanData['email'] = $validated['email'];
            if (isset($validated['nik'])) $karyawanData['nik'] = $validated['nik'];
            if (isset($validated['nama_lengkap'])) $karyawanData['nama_lengkap'] = $validated['nama_lengkap'];
            if (isset($validated['nama_panggilan'])) $karyawanData['nama_panggilan'] = $validated['nama_panggilan'];
            if (isset($validated['gender'])) $karyawanData['gender'] = $validated['gender'];
            if (isset($validated['tempat_lahir'])) $karyawanData['tempat_lahir'] = $validated['tempat_lahir'];
            if (isset($validated['tanggal_lahir'])) $karyawanData['tanggal_lahir'] = $validated['tanggal_lahir'];
            if (isset($validated['alamat'])) $karyawanData['alamat'] = $validated['alamat'];
            if (isset($validated['agama'])) {
                $karyawanData['agama'] = $validated['agama'] === 'none' ? null : $validated['agama'];
            }
            if (isset($validated['status_pernikahan'])) $karyawanData['status_pernikahan'] = $validated['status_pernikahan'];
            if (isset($validated['no_telp'])) $karyawanData['no_telp'] = $validated['no_telp'];
            $karyawanData['updated_by'] = $user->id;

            if (!empty($karyawanData)) {
                $karyawan->update($karyawanData);
            }
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
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

    /**
     * Update personal information
     */
    public function updatePersonalInfo(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nama_panggilan' => 'nullable|string|max:255',
            'gender' => 'required|in:L,P',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'agama' => 'nullable|string|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu',
            'status_pernikahan' => 'nullable|string|in:Belum Menikah,Menikah,Cerai',
            'no_telp' => 'nullable|string|max:20',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();
        $karyawan = MasterKaryawan::where('user_id', $user->id)->first();

        if (!$karyawan) {
            return back()->withErrors(['error' => 'Data karyawan tidak ditemukan']);
        }

        DB::beginTransaction();
        try {
            $karyawanData = [];

            // Handle foto upload to MinIO
            if ($request->hasFile('foto')) {
                $newPath = $this->replaceFileInMinio(
                    $request->file('foto'),
                    $karyawan->foto,
                    'karyawan-photos',
                    'karyawan'
                );

                if ($newPath) {
                    $karyawanData['foto'] = $newPath;
                } else {
                    throw new \Exception('Gagal upload foto ke MinIO');
                }
            }

            $karyawanData['nama_lengkap'] = $validated['nama_lengkap'];
            $karyawanData['nama_panggilan'] = $validated['nama_panggilan'];
            $karyawanData['gender'] = $validated['gender'];
            $karyawanData['tempat_lahir'] = $validated['tempat_lahir'];
            $karyawanData['tanggal_lahir'] = $validated['tanggal_lahir'];
            $karyawanData['alamat'] = $validated['alamat'];
            $karyawanData['agama'] = $validated['agama'];
            $karyawanData['status_pernikahan'] = $validated['status_pernikahan'];
            $karyawanData['no_telp'] = $validated['no_telp'];
            $karyawanData['updated_by'] = $user->id;

            $karyawan->update($karyawanData);

            DB::commit();
            return back()->with('success', 'Informasi pribadi berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui informasi pribadi: ' . $e->getMessage()]);
        }
    }

    /**
     * Update account information
     */
    public function updateAccount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'password' => 'nullable|string|min:8',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            $user->name = $validated['name'];
            $user->email = $validated['email'];

            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }

            $user->save();

            // Also update email in master_karyawan
            $karyawan = MasterKaryawan::where('user_id', $user->id)->first();
            if ($karyawan) {
                $karyawan->update(['email' => $validated['email']]);
            }

            DB::commit();
            return back()->with('success', 'Informasi akun berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui informasi akun']);
        }
    }

    /**
     * Store new vehicle
     */
    public function storeKendaraan(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plat' => 'required|string|max:255|unique:master_kendaraan_karyawan,plat',
            'merk' => 'required|string|max:255',
            'warna' => 'required|string|max:255',
            'cc' => 'required|string|max:255',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            KendaraanKaryawan::create([
                'user_id' => $user->id,
                'plat' => $validated['plat'],
                'merk' => $validated['merk'],
                'warna' => $validated['warna'],
                'cc' => $validated['cc'],
            ]);

            DB::commit();
            return back()->with('success', 'Kendaraan berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan kendaraan']);
        }
    }

    /**
     * Update vehicle
     */
    public function updateKendaraan(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'plat' => 'required|string|max:255|unique:master_kendaraan_karyawan,plat,' . $id,
            'merk' => 'required|string|max:255',
            'warna' => 'required|string|max:255',
            'cc' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $kendaraan = KendaraanKaryawan::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$kendaraan) {
            return back()->withErrors(['error' => 'Kendaraan tidak ditemukan']);
        }

        DB::beginTransaction();
        try {
            $kendaraan->update($validated);

            DB::commit();
            return back()->with('success', 'Kendaraan berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memperbarui kendaraan']);
        }
    }

    /**
     * Delete vehicle
     */
    public function deleteKendaraan(Request $request, $id): RedirectResponse
    {
        $user = $request->user();
        $kendaraan = KendaraanKaryawan::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$kendaraan) {
            return back()->withErrors(['error' => 'Kendaraan tidak ditemukan']);
        }

        DB::beginTransaction();
        try {
            $kendaraan->delete();

            DB::commit();
            return back()->with('success', 'Kendaraan berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus kendaraan']);
        }
    }
}
