<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageVendorRequest;
use App\Models\PackageVendor;
use Illuminate\Http\RedirectResponse;

class PackageVendorController extends Controller
{
    public function store(StorePackageVendorRequest $request): RedirectResponse
    {
        PackageVendor::query()->create($request->validated());

        return back()->with('success', 'Vendor berhasil ditambahkan.');
    }

    public function update(StorePackageVendorRequest $request, PackageVendor $vendor): RedirectResponse
    {
        $vendor->update($request->validated());

        return back()->with('success', 'Vendor berhasil diperbarui.');
    }

    public function destroy(PackageVendor $vendor): RedirectResponse
    {
        if ($vendor->packageConfigs()->exists()) {
            return back()->withErrors(['vendor' => 'Vendor masih digunakan package dan tidak dapat dihapus. Nonaktifkan vendor jika tidak dipakai lagi.']);
        }

        $vendor->delete();

        return back()->with('success', 'Vendor berhasil dihapus.');
    }
}
