<?php

use App\Models\Booking;
use App\Models\PackageRegistration;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PackageRegistration::query()
            ->where('status', 'registered')
            ->orderBy('id')
            ->chunkById(100, function ($registrations): void {
                foreach ($registrations as $registration) {
                    $bookingCode = sprintf(
                        'BK-%s-%04d',
                        $registration->created_at?->format('ymd') ?? now()->format('ymd'),
                        $registration->id,
                    );

                    Booking::query()->firstOrCreate(
                        ['booking_code' => $bookingCode],
                        [
                            'package_id' => $registration->package_id,
                            'departure_schedule_id' => $registration->departure_schedule_id,
                            'full_name' => $registration->full_name,
                            'phone' => $registration->phone,
                            'email' => $registration->email,
                            'origin_city' => $registration->origin_city,
                            'passenger_count' => $registration->passenger_count,
                            'notes' => $registration->notes,
                            'status' => 'registered',
                            'created_at' => $registration->created_at,
                            'updated_at' => $registration->updated_at,
                        ],
                    );

                    $registration->delete();
                }
            });
    }

    public function down(): void
    {
        // Non-reversible.
    }
};
