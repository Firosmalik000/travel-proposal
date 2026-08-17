<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackageRegistrationRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $referralCode = $this->filled('referral_code')
            ? $this->input('referral_code')
            : ($this->session()->get('agent_referral_code') ?: $this->cookie('agent_referral_code'));

        if (filled($referralCode)) {
            $this->merge(['referral_code' => strtoupper(trim((string) $referralCode))]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:150'],
            'origin_city' => ['required', 'string', 'max:100'],
            'passenger_count' => ['required', 'integer', 'min:1'],
            'room_configuration' => ['required', 'array'],
            'room_configuration.single' => ['nullable', 'integer', 'min:0'],
            'room_configuration.double' => ['nullable', 'integer', 'min:0'],
            'room_configuration.triple' => ['nullable', 'integer', 'min:0'],
            'room_configuration.quad' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'referral_code' => [
                'nullable',
                'string',
                'max:40',
                Rule::exists('agent_profiles', 'referral_code')->where('is_active', true),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'email.required' => 'Email wajib diisi untuk membuat akun customer.',
            'email.email' => 'Format email tidak valid.',
            'origin_city.required' => 'Kota asal wajib diisi.',
            'passenger_count.required' => 'Jumlah jamaah wajib diisi.',
            'passenger_count.min' => 'Jumlah jamaah minimal 1 orang.',
            'room_configuration.required' => 'Komposisi kamar wajib dipilih.',
            'referral_code.exists' => 'Kode referral agent tidak valid atau sudah tidak aktif.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $package = $this->route('travelPackage');
            if ($package !== null) {
                if (! $package->is_active || $package->booking_status !== 'open' || $package->start_date?->lt(Carbon::today())) {
                    $validator->errors()->add('passenger_count', 'Keberangkatan package ini tidak tersedia.');
                }

                if ($package->availableSeatsCount() < $this->integer('passenger_count')) {
                    $validator->errors()->add('passenger_count', 'Seat package tidak mencukupi untuk jumlah jamaah yang dipilih.');
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
}
