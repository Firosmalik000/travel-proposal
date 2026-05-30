<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_date' => ['required', 'date'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:1'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'attachments' => ['required', 'array', 'min:1'],
            'attachments.*' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
            'type.required' => 'Tipe transaksi wajib dipilih.',
            'amount.required' => 'Nominal transaksi wajib diisi.',
            'category.required' => 'Kategori transaksi wajib diisi.',
            'attachments.required' => 'Minimal 1 foto nota wajib diupload.',
            'attachments.min' => 'Minimal 1 foto nota wajib diupload.',
            'attachments.*.image' => 'File bukti transaksi harus berupa gambar.',
        ];
    }
}
