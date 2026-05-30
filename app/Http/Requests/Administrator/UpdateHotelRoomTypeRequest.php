<?php

namespace App\Http\Requests\Administrator;

use App\Models\HotelRoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHotelRoomTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var HotelRoomType|null $hotelRoomType */
        $hotelRoomType = $this->route('hotelRoomType');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('hotel_room_types', 'name')->ignore($hotelRoomType?->id)],
            'is_active' => ['boolean'],
        ];
    }
}
