<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\HotelAssignment;
use App\Models\HotelPrice;
use App\Models\PackageCostCalculation;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PackageCostCalculationService
{
    /**
     * @return array<string, mixed>
     */
    public function preview(int $packageId, ?int $departureScheduleId, int $manualAdjustment = 0): array
    {
        return $this->calculatePayload($packageId, $departureScheduleId, $manualAdjustment);
    }

    public function generate(int $packageId, ?int $departureScheduleId, int $manualAdjustment = 0, ?string $notes = null): PackageCostCalculation
    {
        return DB::transaction(function () use ($packageId, $departureScheduleId, $manualAdjustment, $notes): PackageCostCalculation {
            $payload = $this->calculatePayload($packageId, $departureScheduleId, $manualAdjustment);

            $calculation = PackageCostCalculation::query()->create([
                ...$payload,
                'notes' => $notes,
            ]);

            $calculation->items()->createMany($payload['items']);

            return $calculation->load(['package:id,code,name', 'departureSchedule:id,departure_date,departure_city', 'items']);
        });
    }

    public function recalculate(PackageCostCalculation $calculation): PackageCostCalculation
    {
        return DB::transaction(function () use ($calculation): PackageCostCalculation {
            $payload = $this->calculatePayload(
                packageId: (int) $calculation->package_id,
                departureScheduleId: $calculation->departure_schedule_id ? (int) $calculation->departure_schedule_id : null,
                manualAdjustment: (int) $calculation->manual_adjustment,
            );

            $calculation->update([
                ...collect($payload)->except('items')->all(),
                'notes' => $calculation->notes,
            ]);

            $calculation->items()->delete();
            $calculation->items()->createMany($payload['items']);

            return $calculation->load(['package:id,code,name', 'departureSchedule:id,departure_date,departure_city', 'items']);
        });
    }

    public function updatePackagePrice(
        PackageCostCalculation $calculation,
        int $packagePrice,
        ?string $notes,
    ): PackageCostCalculation {
        return DB::transaction(function () use ($calculation, $packagePrice, $notes): PackageCostCalculation {
            $calculation->package()->update([
                'price' => $packagePrice,
            ]);

            $calculation->update([
                'notes' => $notes,
            ]);

            return $calculation->load(['package:id,code,name', 'departureSchedule:id,departure_date,departure_city', 'items']);
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function calculatePayload(int $packageId, ?int $departureScheduleId, int $manualAdjustment): array
    {
        $package = TravelPackage::query()
            ->with(['products:id,code,name,product_type,content'])
            ->findOrFail($packageId);

        $schedule = $departureScheduleId
            ? DepartureSchedule::query()->findOrFail($departureScheduleId)
            : null;

        $bookingBaseQuery = Booking::query()
            ->where('package_id', $packageId)
            ->whereIn('status', ['pending', 'registered'])
            ->when($departureScheduleId !== null, fn ($query) => $query->where('departure_schedule_id', $departureScheduleId));

        $bookingCount = (int) (clone $bookingBaseQuery)->count();
        $customerCount = (int) (clone $bookingBaseQuery)->sum('passenger_count');

        $items = [];
        $warnings = [];
        $hotelTotal = 0;

        $hotelAssignments = HotelAssignment::query()
            ->with(['hotel:id,name', 'rooms.roomType:id,name'])
            ->where('package_id', $packageId)
            ->when($departureScheduleId !== null, fn ($query) => $query->where('departure_schedule_id', $departureScheduleId))
            ->get();

        foreach ($hotelAssignments as $assignment) {
            foreach ($assignment->rooms as $room) {
                $periodDate = $schedule?->departure_date?->toDateString();
                $priceQuery = HotelPrice::query()
                    ->where('hotel_id', $assignment->hotel_id)
                    ->where('room_type_id', $room->room_type_id)
                    ->where('is_active', true);

                if ($periodDate) {
                    $priceQuery
                        ->whereDate('period_start', '<=', $periodDate)
                        ->whereDate('period_end', '>=', $periodDate);
                }

                $price = $priceQuery->orderByDesc('period_start')->first();

                if (! $price) {
                    $warnings[] = sprintf(
                        'Harga hotel belum tersedia untuk %s (%s).',
                        (string) ($assignment->hotel?->name ?? 'Hotel'),
                        (string) ($room->roomType?->name ?? 'Room Type'),
                    );
                }

                $unitPrice = (int) ($price?->price ?? 0);
                $quantity = (int) $room->room_count;
                $totalPrice = $unitPrice * $quantity;
                $hotelTotal += $totalPrice;

                $items[] = [
                    'cost_type' => 'hotel',
                    'reference_type' => 'hotel_assignment_room',
                    'reference_id' => $room->id,
                    'label' => sprintf(
                        '%s - %s',
                        (string) ($assignment->hotel?->name ?? 'Hotel'),
                        (string) ($room->roomType?->name ?? 'Room Type'),
                    ),
                    'description' => $periodDate ? 'Periode keberangkatan '.$periodDate : 'Harga hotel aktif terbaru',
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'meta' => [
                        'hotel_assignment_id' => $assignment->id,
                        'room_capacity' => $room->room_capacity,
                        'period_start' => $price?->period_start?->toDateString(),
                        'period_end' => $price?->period_end?->toDateString(),
                    ],
                ];
            }
        }

        if ($hotelAssignments->isEmpty()) {
            $warnings[] = 'Hotel assignment belum tersedia untuk package/jadwal ini.';
        }

        $productTotal = 0;

        /** @var TravelProduct $product */
        foreach ($package->products as $product) {
            if ($product->product_type === 'hotel') {
                continue;
            }

            $price = (int) data_get($product->content, 'price', 0);
            if ($price <= 0) {
                $warnings[] = sprintf('Harga product belum lengkap: %s', (string) ($product->name ?? $product->code));
            }

            $quantity = max($customerCount, 0);
            $lineTotal = max($price, 0) * $quantity;
            $productTotal += $lineTotal;

            $items[] = [
                'cost_type' => 'product',
                'reference_type' => 'product',
                'reference_id' => $product->id,
                'label' => (string) ($product->name ?? $product->code),
                'description' => 'Biaya product dari Product Management',
                'quantity' => $quantity,
                'unit_price' => max($price, 0),
                'total_price' => $lineTotal,
                'meta' => [
                    'product_code' => $product->code,
                    'product_type' => $product->product_type,
                ],
            ];
        }

        $grandTotal = max($hotelTotal + $productTotal + $manualAdjustment, 0);

        return [
            'package_id' => $packageId,
            'departure_schedule_id' => $departureScheduleId,
            'calculation_date' => Carbon::today()->toDateString(),
            'booking_count' => $bookingCount,
            'customer_count' => $customerCount,
            'hotel_total' => $hotelTotal,
            'product_total' => $productTotal,
            'manual_adjustment' => $manualAdjustment,
            'grand_total' => $grandTotal,
            'hpp_per_customer' => $customerCount > 0 ? (int) floor($grandTotal / $customerCount) : null,
            'currency' => 'IDR',
            'warnings' => array_values(array_unique($warnings)),
            'calculated_at' => now(),
            'items' => $items,
        ];
    }
}
