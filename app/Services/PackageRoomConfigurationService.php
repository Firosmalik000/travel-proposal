<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\TravelPackage;

class PackageRoomConfigurationService
{
    /**
     * @return array{unit:string,double:int,triple:int,quad:int}
     */
    public function normalizePaxAllocation(?array $configuration): array
    {
        return [
            'unit' => 'pax',
            'double' => max(0, (int) data_get($configuration, 'double', 0)),
            'triple' => max(0, (int) data_get($configuration, 'triple', 0)),
            'quad' => max(0, (int) data_get($configuration, 'quad', 0)),
        ];
    }

    /**
     * @return array{double:int,triple:int,quad:int}
     */
    public function normalizeConfiguration(?array $configuration): array
    {
        return [
            'double' => max(0, (int) data_get($configuration, 'double', 0))
                + max(0, (int) data_get($configuration, 'single', 0)),
            'triple' => max(0, (int) data_get($configuration, 'triple', 0)),
            'quad' => max(0, (int) data_get($configuration, 'quad', 0)),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     * @return array{double:int,triple:int,quad:int}
     */
    public function roomCounts(?array $configuration): array
    {
        if (! $this->isPaxAllocation($configuration)) {
            return $this->normalizeConfiguration($configuration);
        }

        $allocation = $this->normalizePaxAllocation($configuration);

        return [
            'double' => (int) ceil($allocation['double'] / 2),
            'triple' => (int) ceil($allocation['triple'] / 3),
            'quad' => (int) ceil($allocation['quad'] / 4),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     */
    public function occupiedPax(?array $configuration): int
    {
        if ($this->isPaxAllocation($configuration)) {
            $allocation = $this->normalizePaxAllocation($configuration);

            return $allocation['double'] + $allocation['triple'] + $allocation['quad'];
        }

        $normalized = $this->normalizeConfiguration($configuration);

        return
            ($normalized['double'] * 2) +
            ($normalized['triple'] * 3) +
            ($normalized['quad'] * 4);
    }

    /**
     * @return array{double:float,triple:float,quad:float}
     */
    public function roomPrices(TravelPackage $travelPackage): array
    {
        $basePrice = $travelPackage->doubleSellingPrice();

        return [
            'double' => $this->resolveRoomPrice(data_get($travelPackage->content, 'room_prices.dbl'), $basePrice),
            'triple' => $this->resolveRoomPrice(data_get($travelPackage->content, 'room_prices.trpl'), 0),
            'quad' => $this->resolveRoomPrice(data_get($travelPackage->content, 'room_prices.quad'), 0),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     */
    public function calculateTotalAmount(TravelPackage $travelPackage, ?array $configuration, ?int $fallbackPassengerCount = null): float
    {
        $occupiedPax = $this->occupiedPax($configuration);

        if ($occupiedPax === 0) {
            $passengerCount = max(1, (int) ($fallbackPassengerCount ?? 0));

            return $passengerCount * $travelPackage->doubleSellingPrice();
        }

        $prices = $this->roomPrices($travelPackage);
        $allocatedPax = $this->allocatedPax(
            $configuration,
            max(1, (int) ($fallbackPassengerCount ?? $occupiedPax)),
        );

        return
            ($allocatedPax['double'] * $prices['double']) +
            ($allocatedPax['triple'] * $prices['triple']) +
            ($allocatedPax['quad'] * $prices['quad']);
    }

    public function calculateBookingAmount(Booking $booking): float
    {
        if ($booking->booking_type === 'custom') {
            return (float) ($booking->custom_total_amount ?? 0);
        }

        if (! $booking->relationLoaded('package') || $booking->package === null) {
            return (float) ($booking->passenger_count * (float) ($booking->package?->price ?? 0));
        }

        return $this->calculateTotalAmount(
            $booking->package,
            is_array($booking->room_configuration) ? $booking->room_configuration : null,
            (int) $booking->passenger_count,
        );
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     * @return array<int, array{type:string,label:string,rooms:int,pax:int,unit_price:float,amount:float}>
     */
    public function buildLineItems(
        TravelPackage $travelPackage,
        ?array $configuration,
        ?int $passengerCount = null,
    ): array {
        $prices = $this->roomPrices($travelPackage);
        $occupiedPax = $this->occupiedPax($configuration);
        $allocatedPax = $this->allocatedPax(
            $configuration,
            max(1, (int) ($passengerCount ?? $occupiedPax)),
        );
        $normalizedRooms = $this->roomCounts($configuration);

        $types = [
            'double' => ['label' => 'Double', 'capacity' => 2],
            'triple' => ['label' => 'Triple', 'capacity' => 3],
            'quad' => ['label' => 'Quad', 'capacity' => 4],
        ];

        $rows = [];

        foreach ($types as $type => $meta) {
            $paxCount = $allocatedPax[$type];
            if ($paxCount < 1) {
                continue;
            }

            $rows[] = [
                'type' => $type,
                'label' => $meta['label'],
                'rooms' => (int) $normalizedRooms[$type],
                'pax' => $paxCount,
                'unit_price' => (float) $prices[$type],
                'amount' => (float) ($paxCount * $prices[$type]),
            ];
        }

        return $rows;
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     */
    public function summarize(?array $configuration): string
    {
        if ($this->isPaxAllocation($configuration)) {
            $allocation = $this->normalizePaxAllocation($configuration);
            $segments = [];

            foreach (['double' => 'double', 'triple' => 'triple', 'quad' => 'quad'] as $type => $label) {
                if ($allocation[$type] > 0) {
                    $segments[] = sprintf('%d pax %s', $allocation[$type], $label);
                }
            }

            return count($segments) > 0 ? implode(' + ', $segments) : '-';
        }

        $normalized = $this->normalizeConfiguration($configuration);

        $segments = [];

        foreach ([
            'double' => 'double',
            'triple' => 'triple',
            'quad' => 'quad',
        ] as $type => $label) {
            $count = (int) $normalized[$type];
            if ($count < 1) {
                continue;
            }

            $segments[] = sprintf('%d %s', $count, $label);
        }

        return count($segments) > 0 ? implode(' + ', $segments) : '-';
    }

    /**
     * @return array{double:int,triple:int,quad:int}
     */
    public function recommendedConfiguration(int $passengerCount): array
    {
        $remaining = max(1, $passengerCount);
        $configuration = [
            'double' => 0,
            'triple' => 0,
            'quad' => 0,
        ];

        foreach ([4 => 'quad', 3 => 'triple', 2 => 'double'] as $capacity => $type) {
            if ($remaining < $capacity) {
                continue;
            }

            $roomCount = intdiv($remaining, $capacity);
            $configuration[$type] = $roomCount;
            $remaining -= $roomCount * $capacity;
        }

        if ($remaining === 1) {
            $configuration['double']++;
        }

        return $configuration;
    }

    /**
     * @param  array{double:int,triple:int,quad:int}  $configuration
     * @return array{double:int,triple:int,quad:int}
     */
    private function allocatePaxByRoomType(array $configuration, int $passengerCount): array
    {
        $remaining = max(0, $passengerCount);
        $allocated = ['double' => 0, 'triple' => 0, 'quad' => 0];

        foreach (['quad' => 4, 'triple' => 3, 'double' => 2] as $type => $capacity) {
            $availableCapacity = $configuration[$type] * $capacity;
            $allocated[$type] = min($remaining, $availableCapacity);
            $remaining -= $allocated[$type];
        }

        return $allocated;
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     * @return array{double:int,triple:int,quad:int}
     */
    private function allocatedPax(?array $configuration, int $passengerCount): array
    {
        if ($this->isPaxAllocation($configuration)) {
            $allocation = $this->normalizePaxAllocation($configuration);

            return [
                'double' => $allocation['double'],
                'triple' => $allocation['triple'],
                'quad' => $allocation['quad'],
            ];
        }

        return $this->allocatePaxByRoomType(
            $this->normalizeConfiguration($configuration),
            $passengerCount,
        );
    }

    /** @param array<string, mixed>|null $configuration */
    private function isPaxAllocation(?array $configuration): bool
    {
        return data_get($configuration, 'unit') === 'pax';
    }

    private function resolveRoomPrice(mixed $value, float $fallback): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        return $fallback;
    }
}
