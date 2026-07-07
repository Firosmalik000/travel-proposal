<?php

namespace App\Http\Requests;

use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
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
            'departure_schedule_id' => ['nullable', 'integer', 'exists:departure_schedules,id'],
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
            'departure_schedule_id.exists' => 'Jadwal keberangkatan yang dipilih tidak valid.',
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
            $schedule = $this->selectedSchedule();
            if ($schedule !== null) {
                if ($schedule->package_id !== $this->integer('travel_package_id')) {
                    $validator->errors()->add('departure_schedule_id', 'Jadwal keberangkatan harus sesuai dengan paket yang dipilih.');
                }

                if (! $schedule->is_active || $schedule->status !== 'open') {
                    $validator->errors()->add('departure_schedule_id', 'Jadwal keberangkatan harus aktif dan berstatus open.');
                }

                $currentRegistration = $this->route('registration');
                $excludingRegistrationId = $currentRegistration instanceof PackageRegistration ? $currentRegistration->id : null;
                if ($schedule->availableSeatsCount($excludingRegistrationId) < $this->integer('passenger_count')) {
                    $validator->errors()->add('departure_schedule_id', 'Seat tersedia pada jadwal ini tidak mencukupi untuk jumlah jamaah yang dipilih.');
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

    public function selectedSchedule(): ?DepartureSchedule
    {
        $scheduleId = $this->integer('departure_schedule_id');
        if ($scheduleId === 0) {
            return null;
        }

        return DepartureSchedule::query()->find($scheduleId);
    }
}
