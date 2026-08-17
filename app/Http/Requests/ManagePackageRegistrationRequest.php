<?php

namespace App\Http\Requests;

use App\Models\Booking;
use App\Models\TravelPackage;
use Illuminate\Foundation\Http\FormRequest;

class ManagePackageRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'travel_package_id' => ['required', 'integer', 'exists:packages,id'],
            'custom_departure_date' => ['nullable', 'date'],
            'custom_return_date' => ['nullable', 'date', 'after_or_equal:custom_departure_date'],
            'custom_unit_price' => ['nullable', 'integer', 'min:0'],
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'origin_city' => ['required', 'string', 'max:100'],
            'passenger_count' => ['required', 'integer', 'min:1'],
            'room_configuration' => ['nullable', 'array'],
            'room_configuration.single' => ['nullable', 'integer', 'min:0'],
            'room_configuration.double' => ['nullable', 'integer', 'min:0'],
            'room_configuration.triple' => ['nullable', 'integer', 'min:0'],
            'room_configuration.quad' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', 'in:pending,registered,cancelled'],
        ];
    }

    public function messages(): array
    {
        return [
            'travel_package_id.required' => 'Paket wajib dipilih.',
            'travel_package_id.exists' => 'Paket yang dipilih tidak valid.',
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'origin_city.required' => 'Kota asal wajib diisi.',
            'passenger_count.required' => 'Jumlah jamaah wajib diisi.',
            'passenger_count.min' => 'Jumlah jamaah minimal 1 orang.',
            'status.required' => 'Status booking wajib dipilih.',
            'status.in' => 'Status booking tidak valid.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $package = TravelPackage::query()->find($this->integer('travel_package_id'));
            if ($package !== null && $this->string('status')->value() === 'registered') {
                $currentBooking = $this->route('registration');
                $excludingBookingId = $currentBooking instanceof Booking ? $currentBooking->id : null;

                if ($package->availableSeatsCount($excludingBookingId) < $this->integer('passenger_count')) {
                    $validator->errors()->add('passenger_count', 'Seat tersedia pada package tidak mencukupi untuk jumlah jamaah yang dipilih.');
                }
            }

            if ($this->filled('room_configuration')) {
                $roomConfiguration = (array) $this->input('room_configuration', []);
                $occupiedPax =
                    max(0, (int) data_get($roomConfiguration, 'single', 0)) +
                    (max(0, (int) data_get($roomConfiguration, 'double', 0)) * 2) +
                    (max(0, (int) data_get($roomConfiguration, 'triple', 0)) * 3) +
                    (max(0, (int) data_get($roomConfiguration, 'quad', 0)) * 4);

                if ($occupiedPax !== $this->integer('passenger_count')) {
                    $validator->errors()->add('room_configuration', 'Komposisi kamar harus sama dengan jumlah jamaah yang dipilih.');
                }
            }
        });
    }
}
