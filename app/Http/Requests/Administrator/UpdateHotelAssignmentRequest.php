<?php

namespace App\Http\Requests\Administrator;

use App\Models\HotelAssignment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHotelAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var HotelAssignment|null $assignment */
        $assignment = $this->route('assignment');

        return [
            'travel_package_id' => ['required', 'integer', 'exists:packages,id'],
            'departure_schedule_id' => [
                'required',
                'integer',
                'exists:departure_schedules,id',
                Rule::exists('departure_schedules', 'id')
                    ->where(fn ($query) => $query->where('package_id', (int) $this->input('travel_package_id'))),
            ],
            'hotel_id' => [
                'required',
                'integer',
                'exists:hotels,id',
                Rule::unique('hotel_assignments', 'hotel_id')
                    ->where(fn ($query) => $query->where('departure_schedule_id', (int) $this->input('departure_schedule_id')))
                    ->ignore($assignment?->id),
            ],
            'status' => ['required', 'string', Rule::in(['draft', 'confirmed'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'rooms' => ['required', 'array', 'min:1'],
            'rooms.*.room_type_id' => ['required', 'integer', 'exists:hotel_room_types,id'],
            'rooms.*.room_count' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'hotel_id.unique' => 'Hotel ini sudah pernah di-assign pada jadwal keberangkatan yang sama.',
            'rooms.min' => 'Minimal isi 1 room allocation.',
            'rooms.*.room_count.min' => 'Jumlah room minimal 1.',
            'departure_schedule_id.exists' => 'Jadwal tidak sesuai dengan package yang dipilih.',
        ];
    }
}
