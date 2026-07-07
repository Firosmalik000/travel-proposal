<?php

namespace App\Http\Requests;

use App\Models\DepartureSchedule;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class StorePackageRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'departure_schedule_id' => ['nullable', 'integer'],
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'origin_city' => ['required', 'string', 'max:100'],
            'passenger_count' => ['required', 'integer', 'min:1'],
            'room_configuration' => ['required', 'array'],
            'room_configuration.single' => ['nullable', 'integer', 'min:0'],
            'room_configuration.double' => ['nullable', 'integer', 'min:0'],
            'room_configuration.triple' => ['nullable', 'integer', 'min:0'],
            'room_configuration.quad' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'origin_city.required' => 'Kota asal wajib diisi.',
            'passenger_count.required' => 'Jumlah jamaah wajib diisi.',
            'passenger_count.min' => 'Jumlah jamaah minimal 1 orang.',
            'room_configuration.required' => 'Komposisi kamar wajib dipilih.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $schedule = $this->selectedSchedule();

            if ($schedule !== null) {
                if (
                    ! $schedule->is_active
                    || $schedule->status !== 'open'
                    || $schedule->departure_date?->lt(Carbon::today())
                ) {
                    $validator->errors()->add(
                        'departure_schedule_id',
                        'Jadwal keberangkatan yang dipilih tidak tersedia.',
                    );
                }

                if ($schedule->availableSeatsCount() < $this->integer('passenger_count')) {
                    $validator->errors()->add(
                        'departure_schedule_id',
                        'Seat tersedia pada jadwal ini tidak mencukupi untuk jumlah jamaah yang dipilih.',
                    );
                }
            }

            $roomConfiguration = (array) $this->input('room_configuration', []);
            $occupiedPax =
                max(0, (int) data_get($roomConfiguration, 'single', 0)) +
                (max(0, (int) data_get($roomConfiguration, 'double', 0)) * 2) +
                (max(0, (int) data_get($roomConfiguration, 'triple', 0)) * 3) +
                (max(0, (int) data_get($roomConfiguration, 'quad', 0)) * 4);

            if ($occupiedPax !== $this->integer('passenger_count')) {
                $validator->errors()->add(
                    'room_configuration',
                    'Komposisi kamar harus sama dengan jumlah jamaah yang dipilih.',
                );
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
