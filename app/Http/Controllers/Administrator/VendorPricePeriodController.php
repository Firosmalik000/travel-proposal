<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreVendorPricePeriodRequest;
use App\Models\PackageVendor;
use App\Models\VendorPricePeriod;
use Illuminate\Http\RedirectResponse;

class VendorPricePeriodController extends Controller
{
    public function store(StoreVendorPricePeriodRequest $request, PackageVendor $vendor): RedirectResponse
    {
        $vendor->pricePeriods()->create($request->validated());

        return back()->with('success', 'Periode harga vendor berhasil ditambahkan.');
    }

    public function update(StoreVendorPricePeriodRequest $request, PackageVendor $vendor, VendorPricePeriod $period): RedirectResponse
    {
        abort_if($period->package_vendor_id !== $vendor->id, 404);
        $period->update($request->validated());

        return back()->with('success', 'Periode harga vendor berhasil diperbarui.');
    }

    public function destroy(PackageVendor $vendor, VendorPricePeriod $period): RedirectResponse
    {
        abort_if($period->package_vendor_id !== $vendor->id, 404);

        if ($period->packageConfigs()->exists()) {
            return back()->withErrors(['period' => 'Periode masih digunakan package dan tidak dapat dihapus. Nonaktifkan periode jika tidak dipakai lagi.']);
        }

        $period->delete();

        return back()->with('success', 'Periode harga vendor berhasil dihapus.');
    }
}
