<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBookingPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('menu.booking_listing.edit') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $bookingCurrency = strtoupper((string) (
            $this->route('booking')?->agreed_currency
            ?? $this->route('booking')?->custom_currency
            ?? $this->route('booking')?->package?->currency
            ?? 'IDR'
        ));

        return [
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'exchange_rate' => ['required', 'numeric', 'min:0.00000001'],
            'financial_account_id' => [
                'required_if:status,confirmed',
                'nullable',
                'integer',
                Rule::exists('financial_accounts', 'id')->where(
                    fn ($query) => $query
                        ->where('is_active', true)
                        ->where('is_cash_account', true)
                        ->where('cash_account_type', '!=', 'legacy')
                        ->where('currency', $bookingCurrency),
                ),
            ],
            'payment_method' => ['required', 'string', 'max:50'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'in:pending,confirmed,void'],
            'idempotency_key' => ['required', 'string', 'max:100'],
            'attachment' => ['nullable', 'image', 'max:5120'],
            'attachment_override_reason' => ['nullable', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->input('status') !== 'confirmed') {
                return;
            }

            $bookingCurrency = strtoupper((string) (
                $this->route('booking')?->agreed_currency
                ?? $this->route('booking')?->custom_currency
                ?? $this->route('booking')?->package?->currency
                ?? 'IDR'
            ));
            $currency = strtoupper((string) $this->input('currency'));

            if ($currency !== $bookingCurrency) {
                $validator->errors()->add('currency', 'Mata uang pembayaran harus sama dengan mata uang booking.');
            }

            if ($currency === 'IDR' && (float) $this->input('exchange_rate') !== 1.0) {
                $validator->errors()->add('exchange_rate', 'Kurs pembayaran IDR harus bernilai 1.');
            }

            $existingPayment = $this->route('payment');
            $hasStoredAttachment = is_string($existingPayment?->attachment_path)
                && $existingPayment->attachment_path !== '';
            $hasOverrideReason = filled($this->input('attachment_override_reason'));

            if (! $this->hasFile('attachment') && ! $hasStoredAttachment && ! $hasOverrideReason) {
                $validator->errors()->add(
                    'attachment',
                    'Unggah bukti pembayaran atau isi alasan verifikasi tanpa bukti.',
                );
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'currency' => strtoupper((string) $this->input('currency', 'IDR')),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.min' => 'Nominal pembayaran minimal 1.',
            'status.in' => 'Status pembayaran tidak valid.',
            'financial_account_id.required_if' => 'Pilih rekening penerima sebelum pembayaran diverifikasi.',
            'financial_account_id.exists' => 'Rekening penerima harus aktif, terklasifikasi, dan menggunakan mata uang booking.',
            'attachment_override_reason.min' => 'Alasan verifikasi tanpa bukti minimal 10 karakter.',
        ];
    }
}
