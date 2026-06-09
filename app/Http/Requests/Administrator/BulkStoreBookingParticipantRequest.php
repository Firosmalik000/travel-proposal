<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BulkStoreBookingParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.full_name' => ['required', 'string', 'max:150'],
            'participants.*.gender' => ['nullable', 'in:male,female'],
            'participants.*.birth_place' => ['nullable', 'string', 'max:100'],
            'participants.*.birth_date' => ['nullable', 'date'],
            'participants.*.marital_status' => ['nullable', 'in:single,married,divorced,widowed'],
            'participants.*.address' => ['nullable', 'string', 'max:1000'],
            'participants.*.needs_wheelchair' => ['nullable', 'boolean'],
            'participants.*.shirt_size' => ['nullable', 'in:XS,S,M,L,XL,XXL,XXXL'],
            'participants.*.passport_ready' => ['nullable', 'boolean'],
            'participants.*.passport_issue_date' => ['nullable', 'date'],
            'participants.*.passport_expiry_date' => ['nullable', 'date'],
            'participants.*.passport_type' => ['nullable', 'in:ordinary,e_passport,diplomatic,official'],
            'participants.*.has_medical_history' => ['nullable', 'boolean'],
            'participants.*.medical_history_notes' => ['nullable', 'string', 'max:1000'],
            'participants.*.emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'participants.*.emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'participants.*.emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            'participants.*.has_performed_umrah' => ['nullable', 'boolean'],
            'participants.*.referral_source' => ['nullable', 'string', 'max:150'],
            'participants.*.passport_scan_url' => ['nullable', 'string', 'max:2048'],
            'participants.*.family_card_scan_url' => ['nullable', 'string', 'max:2048'],
            'participants.*.marriage_book_scan_url' => ['nullable', 'string', 'max:2048'],
            'participants.*.birth_certificate_scan_url' => ['nullable', 'string', 'max:2048'],
            'participants.*.photo_url' => ['nullable', 'string', 'max:2048'],
            'participants.*.meningitis_vaccine_scan_url' => ['nullable', 'string', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'participants.required' => 'Data peserta impor wajib diisi.',
            'participants.min' => 'Minimal ada 1 data peserta untuk diimpor.',
            'participants.*.full_name.required' => 'Nama peserta wajib diisi pada setiap baris.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ((array) $this->input('participants', []) as $index => $participant) {
                $issueDate = (string) data_get($participant, 'passport_issue_date', '');
                $expiryDate = (string) data_get($participant, 'passport_expiry_date', '');

                if ($issueDate !== '' && $expiryDate !== '' && $expiryDate < $issueDate) {
                    $validator->errors()->add(
                        "participants.$index.passport_expiry_date",
                        'Tanggal kadaluarsa paspor harus setelah tanggal terbit.'
                    );
                }
            }
        });
    }
}
