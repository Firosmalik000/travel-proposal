<?php

namespace App\Http\Requests\Customer;

use App\Http\Requests\Administrator\UpdateBookingParticipantRequest as AdministratorUpdateBookingParticipantRequest;
use App\Models\Booking;

class UpdateBookingParticipantRequest extends AdministratorUpdateBookingParticipantRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $booking instanceof Booking && ($this->user()?->can('update', $booking) ?? false);
    }
}
