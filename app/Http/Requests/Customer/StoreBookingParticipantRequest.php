<?php

namespace App\Http\Requests\Customer;

use App\Http\Requests\Administrator\StoreBookingParticipantRequest as AdministratorStoreBookingParticipantRequest;
use App\Models\Booking;

class StoreBookingParticipantRequest extends AdministratorStoreBookingParticipantRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $booking instanceof Booking && ($this->user()?->can('update', $booking) ?? false);
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $booking = $this->route('booking');

            if ($booking instanceof Booking && $booking->participants()->count() >= (int) $booking->passenger_count) {
                $validator->errors()->add('full_name', 'Semua slot peserta pada booking ini sudah terisi.');
            }
        });
    }
}
