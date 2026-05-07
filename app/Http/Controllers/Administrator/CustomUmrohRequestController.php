<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveCustomUmrohRequestRequest;
use App\Models\Booking;
use App\Models\CustomUmrohRequest;
use App\Models\TravelPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomUmrohRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => (string) $request->string('status')->value(),
        ];

        $rows = CustomUmrohRequest::query()
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];
                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('request_code', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%");
                });
            })
            ->when(in_array($filters['status'], ['new', 'approved', 'rejected'], true), function ($query) use ($filters): void {
                $query->where('status', $filters['status']);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (CustomUmrohRequest $item): array => [
                'id' => $item->id,
                'request_code' => $item->request_code,
                'full_name' => $item->full_name,
                'phone' => $item->phone,
                'email' => $item->email,
                'origin_city' => $item->origin_city,
                'passenger_count' => (int) $item->passenger_count,
                'group_type' => $item->group_type,
                'departure_month' => $item->departure_month,
                'departure_date' => $item->departure_date?->toDateString(),
                'return_date' => $item->return_date?->toDateString(),
                'budget' => $item->budget !== null ? (int) $item->budget : null,
                'focus' => $item->focus,
                'room_preference' => $item->room_preference,
                'notes' => $item->notes,
                'status' => $item->status,
                'booking_id' => $item->booking_id,
                'created_at' => $item->created_at?->toDateTimeString(),
                'approved_at' => $item->approved_at?->toDateTimeString(),
                'rejected_at' => $item->rejected_at?->toDateTimeString(),
            ]);

        return Inertia::render('Dashboard/Booking/CustomRequests/Index', [
            'requests' => $rows,
            'filters' => $filters,
        ]);
    }

    public function approve(
        ApproveCustomUmrohRequestRequest $request,
        CustomUmrohRequest $customUmrohRequest,
    ): RedirectResponse {
        if ($customUmrohRequest->status === 'approved') {
            return back()->with('error', 'Request ini sudah di-approve.');
        }

        if ($customUmrohRequest->status === 'rejected') {
            return back()->with('error', 'Request ini sudah di-reject.');
        }

        $payload = $request->validated();

        return DB::transaction(function () use ($customUmrohRequest, $payload, $request): RedirectResponse {
            $packageId = $this->customPlaceholderPackageId();

            $bookingCode = sprintf(
                'BK-%s-CU%04d',
                now()->format('ymd'),
                $customUmrohRequest->id,
            );

            $booking = Booking::query()->create([
                'booking_code' => $bookingCode,
                'package_id' => (int) $packageId,
                'departure_schedule_id' => null,
                'booking_type' => 'custom',
                'custom_departure_date' => $payload['custom_departure_date'] ?? null,
                'custom_return_date' => $payload['custom_return_date'] ?? null,
                'custom_unit_price' => (int) $payload['custom_unit_price'],
                'custom_total_amount' => (int) $payload['custom_unit_price'] * (int) $payload['passenger_count'],
                'custom_currency' => 'IDR',
                'full_name' => $customUmrohRequest->full_name,
                'phone' => $customUmrohRequest->phone,
                'email' => $customUmrohRequest->email,
                'origin_city' => (string) $payload['origin_city'],
                'passenger_count' => (int) $payload['passenger_count'],
                'notes' => $payload['notes'] ?? $customUmrohRequest->notes,
                'status' => 'registered',
            ]);

            $customUmrohRequest->forceFill([
                'status' => 'approved',
                'booking_id' => $booking->id,
                'approved_by' => $request->user()?->id,
                'approved_at' => now(),
            ])->save();

            return to_route('booking.custom-bookings.index')->with('success', 'Request custom berhasil di-approve menjadi custom booking.');
        });
    }

    public function reject(Request $request, CustomUmrohRequest $customUmrohRequest): RedirectResponse
    {
        if ($customUmrohRequest->status === 'approved') {
            return back()->with('error', 'Request ini sudah di-approve.');
        }

        if ($customUmrohRequest->status === 'rejected') {
            return back()->with('error', 'Request ini sudah di-reject.');
        }

        $customUmrohRequest->forceFill([
            'status' => 'rejected',
            'rejected_by' => $request->user()?->id,
            'rejected_at' => now(),
        ])->save();

        return back()->with('success', 'Request custom berhasil di-reject.');
    }

    private function customPlaceholderPackageId(): int
    {
        $package = TravelPackage::query()->firstOrCreate(
            ['code' => 'CUSTOM-REQUEST'],
            [
                'slug' => 'custom-request',
                'name' => ['id' => 'Custom Request', 'en' => 'Custom Request'],
                'package_type' => 'custom',
                'departure_city' => 'Custom',
                'duration_days' => 0,
                'price' => 0,
                'currency' => 'IDR',
                'summary' => ['id' => 'Booking hasil approval custom request.', 'en' => 'Booking created from custom request approval.'],
                'content' => [],
                'is_featured' => false,
                'is_active' => false,
                'image_path' => null,
            ],
        );

        if (! $package->slug) {
            $package->forceFill(['slug' => Str::slug((string) $package->code)])->save();
        }

        return (int) $package->id;
    }
}
