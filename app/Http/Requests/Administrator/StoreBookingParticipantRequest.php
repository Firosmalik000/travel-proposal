<?php

namespace App\Http\Requests\Administrator;

use App\Models\Booking;
use App\Support\ParticipantUploadLimit;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxKilobytes = $this->participantUploadMaxKilobytes();

        return [
            'full_name' => ['required', 'string', 'max:150'],
            'gender' => ['nullable', 'in:male,female'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'marital_status' => ['nullable', 'in:single,married,divorced,widowed'],
            'address' => ['nullable', 'string', 'max:1000'],
            'needs_wheelchair' => ['nullable', 'boolean'],
            'shirt_size' => ['nullable', 'in:XS,S,M,L,XL,XXL,XXXL'],
            'passport_ready' => ['nullable', 'boolean'],
            'passport_issue_date' => ['nullable', 'date'],
            'passport_expiry_date' => ['nullable', 'date', 'after:passport_issue_date'],
            'passport_type' => ['nullable', 'in:ordinary,e_passport,diplomatic,official'],
            'passport_scan' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', "max:{$maxKilobytes}"],
            'passport_scan_url' => ['nullable', 'string', 'max:2048'],
            'family_card_scan' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', "max:{$maxKilobytes}"],
            'family_card_scan_url' => ['nullable', 'string', 'max:2048'],
            'marriage_book_scan' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', "max:{$maxKilobytes}"],
            'marriage_book_scan_url' => ['nullable', 'string', 'max:2048'],
            'birth_certificate_scan' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', "max:{$maxKilobytes}"],
            'birth_certificate_scan_url' => ['nullable', 'string', 'max:2048'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', "max:{$maxKilobytes}"],
            'photo_url' => ['nullable', 'string', 'max:2048'],
            'meningitis_vaccine_scan' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', "max:{$maxKilobytes}"],
            'meningitis_vaccine_scan_url' => ['nullable', 'string', 'max:2048'],
            'has_medical_history' => ['nullable', 'boolean'],
            'medical_history_notes' => ['nullable', 'string', 'max:1000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            'has_performed_umrah' => ['nullable', 'boolean'],
            'referral_source' => ['nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        $maxMegabytes = number_format($this->participantUploadMaxKilobytes() / 1024, 0);

        return [
            'full_name.required' => 'Nama peserta wajib diisi.',
            'passport_expiry_date.after' => 'Tanggal kadaluarsa paspor harus setelah tanggal terbit.',
            'photo.image' => 'Pas foto harus berupa gambar.',
            'passport_scan.max' => "Ukuran scan paspor maksimal {$maxMegabytes} MB.",
            'family_card_scan.max' => "Ukuran kartu keluarga maksimal {$maxMegabytes} MB.",
            'marriage_book_scan.max' => "Ukuran buku nikah maksimal {$maxMegabytes} MB.",
            'birth_certificate_scan.max' => "Ukuran akta kelahiran maksimal {$maxMegabytes} MB.",
            'photo.max' => "Ukuran pas foto maksimal {$maxMegabytes} MB.",
            'meningitis_vaccine_scan.max' => "Ukuran vaksin meningitis maksimal {$maxMegabytes} MB.",
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $booking = $this->route('registration');
            if (! $booking instanceof Booking) {
                return;
            }

            if ($booking->participants()->count() >= max((int) $booking->passenger_count, 0)) {
                $validator->errors()->add('full_name', 'Jumlah peserta sudah mencapai maksimal sesuai jumlah pax booking.');
            }
        });
    }

    private function participantUploadMaxKilobytes(): int
    {
        return ParticipantUploadLimit::kilobytes();
    }
}
