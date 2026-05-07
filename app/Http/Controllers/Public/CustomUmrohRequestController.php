<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomUmrohRequestRequest;
use App\Models\CustomUmrohRequest;
use App\Services\CustomUmrohRequestNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class CustomUmrohRequestController extends Controller
{
    public function __construct(private readonly CustomUmrohRequestNotifier $customUmrohRequestNotifier) {}

    public function store(StoreCustomUmrohRequestRequest $request): RedirectResponse
    {
        $payload = $request->validated();

        $requestCode = sprintf(
            'CU-%s-%s',
            now()->format('ymd'),
            strtoupper(Str::random(6)),
        );

        $customUmrohRequest = CustomUmrohRequest::query()->create([
            'request_code' => $requestCode,
            'full_name' => $payload['full_name'],
            'phone' => $payload['phone'],
            'email' => $payload['email'] ?? null,
            'origin_city' => $payload['origin_city'],
            'passenger_count' => (int) $payload['passenger_count'],
            'group_type' => $payload['group_type'],
            'departure_month' => $payload['departure_month'],
            'departure_date' => $payload['departure_date'] ?? null,
            'return_date' => $payload['return_date'] ?? null,
            'budget' => isset($payload['budget']) ? (int) $payload['budget'] : null,
            'focus' => $payload['focus'],
            'room_preference' => $payload['room_preference'],
            'notes' => $payload['notes'] ?? null,
            'status' => 'new',
        ]);

        $this->customUmrohRequestNotifier->notifyAdmin($customUmrohRequest);

        return to_route('public.custom')->with('success', 'Request custom umroh berhasil dikirim.');
    }
}
