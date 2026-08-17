<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Booking\BuildBookingCustomerData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\IndexBookingCustomerDataRequest;
use App\Models\TravelPackage;
use Inertia\Inertia;
use Inertia\Response;

class BookingCustomerDataController extends Controller
{
    public function index(
        IndexBookingCustomerDataRequest $request,
        BuildBookingCustomerData $buildBookingCustomerData,
    ): Response {
        $validated = $request->validated();

        return Inertia::render(
            'Dashboard/Booking/CustomerData/Index',
            $buildBookingCustomerData->handle(
                [
                    'search' => (string) ($validated['search'] ?? ''),
                    'status' => (string) ($validated['status'] ?? 'registered'),
                    'travel_package_id' => isset($validated['travel_package_id'])
                        ? (int) $validated['travel_package_id']
                        : null,
                ],
                includeBookingDetails: false,
            ),
        );
    }

    public function show(
        IndexBookingCustomerDataRequest $request,
        TravelPackage $travelPackage,
        BuildBookingCustomerData $buildBookingCustomerData,
    ): Response {
        $validated = $request->validated();
        $data = $buildBookingCustomerData->handle([
            'search' => (string) ($validated['search'] ?? ''),
            'status' => (string) ($validated['status'] ?? 'registered'),
            'travel_package_id' => $travelPackage->id,
        ]);

        abort_if($data['selectedPackage'] === null, 404);

        return Inertia::render('Dashboard/Booking/CustomerData/Show', $data);
    }
}
