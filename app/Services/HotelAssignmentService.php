<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\HotelAssignment;
use App\Models\HotelRoomType;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HotelAssignmentService
{
    /**
     * @param  array<int, array{room_type_id:int,room_count:int}>  $rooms
     */
    public function create(array $payload, array $rooms): HotelAssignment
    {
        return DB::transaction(function () use ($payload, $rooms): HotelAssignment {
            $this->validateCapacity(
                packageId: (int) $payload['package_id'],
                rooms: $rooms,
            );

            $assignment = HotelAssignment::query()->create($payload);
            $assignment->rooms()->createMany($this->roomPayload($rooms));

            return $assignment->load(['package', 'hotel', 'rooms.roomType']);
        });
    }

    /**
     * @param  array<int, array{room_type_id:int,room_count:int}>  $rooms
     */
    public function update(HotelAssignment $assignment, array $payload, array $rooms): HotelAssignment
    {
        return DB::transaction(function () use ($assignment, $payload, $rooms): HotelAssignment {
            $this->validateCapacity(
                packageId: (int) $payload['package_id'],
                rooms: $rooms,
            );

            $assignment->update($payload);
            $assignment->rooms()->delete();
            $assignment->rooms()->createMany($this->roomPayload($rooms));

            return $assignment->load(['package', 'hotel', 'rooms.roomType']);
        });
    }

    public function delete(HotelAssignment $assignment): void
    {
        DB::transaction(function () use ($assignment): void {
            $assignment->rooms()->delete();
            $assignment->delete();
        });
    }

    /**
     * @param  array<int, array{room_type_id:int,room_count:int}>  $rooms
     * @return array<int, array{room_type_id:int,room_count:int,room_capacity:int}>
     */
    private function roomPayload(array $rooms): array
    {
        $roomTypes = HotelRoomType::query()
            ->whereIn('id', collect($rooms)->pluck('room_type_id')->all())
            ->get(['id', 'name'])
            ->keyBy('id');

        return collect($rooms)
            ->map(function (array $room) use ($roomTypes): array {
                $roomType = $roomTypes->get((int) $room['room_type_id']);

                return [
                    'room_type_id' => (int) $room['room_type_id'],
                    'room_count' => (int) $room['room_count'],
                    'room_capacity' => $this->resolveRoomCapacity((string) ($roomType?->name ?? '')),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array{room_type_id:int,room_count:int}>  $rooms
     */
    private function validateCapacity(int $packageId, array $rooms): void
    {
        $customerCount = (int) Booking::query()
            ->whereIn('status', ['pending', 'registered'])
            ->where('package_id', $packageId)
            ->sum('passenger_count');

        $roomTypes = HotelRoomType::query()
            ->whereIn('id', collect($rooms)->pluck('room_type_id')->all())
            ->get(['id', 'name'])
            ->keyBy('id');

        $capacity = collect($rooms)->sum(function (array $room) use ($roomTypes): int {
            $roomType = $roomTypes->get((int) $room['room_type_id']);

            return (int) $room['room_count'] * $this->resolveRoomCapacity((string) ($roomType?->name ?? ''));
        });

        if ($capacity < $customerCount) {
            throw ValidationException::withMessages([
                'rooms' => sprintf(
                    'Total kapasitas kamar (%d) tidak boleh kurang dari total customer (%d).',
                    $capacity,
                    $customerCount,
                ),
            ]);
        }
    }

    private function resolveRoomCapacity(string $roomTypeName): int
    {
        $name = strtoupper(trim($roomTypeName));

        if (str_contains($name, 'DBL') || str_contains($name, 'DOUBLE')) {
            return 2;
        }

        if (str_contains($name, 'TRPL') || str_contains($name, 'TRIPLE')) {
            return 3;
        }

        if (str_contains($name, 'QUAD')) {
            return 4;
        }

        return 1;
    }
}
