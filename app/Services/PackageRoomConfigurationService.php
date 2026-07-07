<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\TravelPackage;

class PackageRoomConfigurationService
{
    /**
     * @return array{single:int,double:int,triple:int,quad:int}
     */
    public function normalizeConfiguration(?array $configuration): array
    {
        return [
            'single' => max(0, (int) data_get($configuration, 'single', 0)),
            'double' => max(0, (int) data_get($configuration, 'double', 0)),
            'triple' => max(0, (int) data_get($configuration, 'triple', 0)),
            'quad' => max(0, (int) data_get($configuration, 'quad', 0)),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     */
    public function occupiedPax(?array $configuration): int
    {
        $normalized = $this->normalizeConfiguration($configuration);

        return
            $normalized['single'] +
            ($normalized['double'] * 2) +
            ($normalized['triple'] * 3) +
            ($normalized['quad'] * 4);
    }

    /**
     * @return array{single:float,double:float,triple:float,quad:float}
     */
    public function roomPrices(TravelPackage $travelPackage): array
    {
        $basePrice = (float) ($travelPackage->price ?? 0);

        return [
            'single' => $basePrice,
            'double' => $this->resolveRoomPrice(data_get($travelPackage->content, 'room_prices.dbl'), $basePrice),
            'triple' => $this->resolveRoomPrice(data_get($travelPackage->content, 'room_prices.trpl'), $basePrice),
            'quad' => $this->resolveRoomPrice(data_get($travelPackage->content, 'room_prices.quad'), $basePrice),
        ];
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     */
    public function calculateTotalAmount(TravelPackage $travelPackage, ?array $configuration, ?int $fallbackPassengerCount = null): float
    {
        $normalized = $this->normalizeConfiguration($configuration);
        $occupiedPax = $this->occupiedPax($normalized);

        if ($occupiedPax === 0) {
            $passengerCount = max(1, (int) ($fallbackPassengerCount ?? 0));

            return $passengerCount * (float) ($travelPackage->price ?? 0);
        }

        $prices = $this->roomPrices($travelPackage);

        return
            ($normalized['single'] * $prices['single']) +
            ($normalized['double'] * 2 * $prices['double']) +
            ($normalized['triple'] * 3 * $prices['triple']) +
            ($normalized['quad'] * 4 * $prices['quad']);
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
    public function buildLineItems(TravelPackage $travelPackage, ?array $configuration): array
    {
        $normalized = $this->normalizeConfiguration($configuration);
        $prices = $this->roomPrices($travelPackage);

        $types = [
            'single' => ['label' => 'Single', 'capacity' => 1],
            'double' => ['label' => 'Double', 'capacity' => 2],
            'triple' => ['label' => 'Triple', 'capacity' => 3],
            'quad' => ['label' => 'Quad', 'capacity' => 4],
        ];

        $rows = [];

        foreach ($types as $type => $meta) {
            $roomCount = (int) $normalized[$type];
            if ($roomCount < 1) {
                continue;
            }

            $paxCount = $roomCount * $meta['capacity'];

            $rows[] = [
                'type' => $type,
                'label' => $meta['label'],
                'rooms' => $roomCount,
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
        $normalized = $this->normalizeConfiguration($configuration);

        $segments = [];

        foreach ([
            'single' => 'single',
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
     * @return array{single:int,double:int,triple:int,quad:int}
     */
    public function recommendedConfiguration(int $passengerCount): array
    {
        $remaining = max(1, $passengerCount);
        $configuration = [
            'single' => 0,
            'double' => 0,
            'triple' => 0,
            'quad' => 0,
        ];

        foreach ([4 => 'quad', 3 => 'triple', 2 => 'double', 1 => 'single'] as $capacity => $type) {
            if ($remaining < $capacity) {
                continue;
            }

            $roomCount = intdiv($remaining, $capacity);
            $configuration[$type] = $roomCount;
            $remaining -= $roomCount * $capacity;
        }

        return $configuration;
    }

    private function resolveRoomPrice(mixed $value, float $fallback): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        return $fallback;
    }
}
