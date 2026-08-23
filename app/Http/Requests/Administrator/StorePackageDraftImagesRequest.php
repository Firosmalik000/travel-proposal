<?php

namespace App\Http\Requests\Administrator;

use App\Support\ParticipantUploadLimit;
use Illuminate\Foundation\Http\FormRequest;

class StorePackageDraftImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxImageKilobytes = ParticipantUploadLimit::kilobytes(4096);

        return [
            'images' => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:'.$maxImageKilobytes],
        ];
    }

    public function messages(): array
    {
        return [
            'images.required' => 'Pilih minimal satu gambar.',
            'images.max' => 'Maksimal 10 gambar dalam satu upload.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Format gambar harus PNG, JPG, JPEG, atau WEBP.',
            'images.*.max' => 'Ukuran setiap gambar melebihi batas yang diizinkan.',
        ];
    }
}
