<?php

namespace App\Services;

class HotelProductPricingResolver
{
    /**
     * @param  iterable<int, array<string, mixed>>  $pricingRows
     * @return array<string, mixed>|null
     */
    public function resolve(
        iterable $pricingRows,
        string $roomType,
        ?string $selectedBroker,
        ?string $periodDate,
    ): ?array {
        $normalizedRoomType = $this->normalizeRoomType($roomType);
        $normalizedBroker = $this->normalizeBroker($selectedBroker);

        return collect($pricingRows)
            ->filter(fn (mixed $row): bool => is_array($row))
            ->filter(function (array $row) use ($normalizedRoomType, $normalizedBroker, $periodDate): bool {
                if ($this->normalizeRoomType((string) ($row['room_type'] ?? '')) !== $normalizedRoomType) {
                    return false;
                }

                if ($normalizedBroker !== null) {
                    $brokerName = $this->normalizeBroker((string) ($row['broker_name'] ?? ''));
                    $brokerKey = $this->normalizeBroker((string) ($row['broker_key'] ?? ''));

                    if ($brokerName !== $normalizedBroker && $brokerKey !== $normalizedBroker) {
                        return false;
                    }
                }

                if ($periodDate === null || $periodDate === '') {
                    return true;
                }

                $periodStart = data_get($row, 'period_start');
                $periodEnd = data_get($row, 'period_end');

                return is_string($periodStart)
                    && is_string($periodEnd)
                    && $periodStart <= $periodDate
                    && $periodEnd >= $periodDate;
            })
            ->sortByDesc(fn (array $row): string => (string) ($row['period_start'] ?? ''))
            ->map(fn (array $row): array => $row)
            ->first();
    }

    private function normalizeRoomType(string $value): string
    {
        return match (strtolower(trim($value))) {
            'dbl', 'double' => 'double',
            'trpl', 'triple' => 'triple',
            'quad', 'quadruple' => 'quad',
            default => strtolower(trim($value)),
        };
    }

    private function normalizeBroker(?string $value): ?string
    {
        $normalized = strtolower(trim((string) $value));

        return $normalized !== '' ? $normalized : null;
    }
}
