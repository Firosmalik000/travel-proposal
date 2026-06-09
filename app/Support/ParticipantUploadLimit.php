<?php

namespace App\Support;

final class ParticipantUploadLimit
{
    public static function kilobytes(int $applicationMaxKilobytes = 5120): int
    {
        return min(
            $applicationMaxKilobytes,
            self::phpIniSizeToKilobytes((string) ini_get('upload_max_filesize')),
            self::phpIniSizeToKilobytes((string) ini_get('post_max_size')),
        );
    }

    public static function megabyteLabel(int $applicationMaxKilobytes = 5120): string
    {
        return number_format(self::kilobytes($applicationMaxKilobytes) / 1024, 0);
    }

    private static function phpIniSizeToKilobytes(string $value): int
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            return 0;
        }

        $unit = strtolower(substr($trimmed, -1));
        $number = (float) $trimmed;

        return match ($unit) {
            'g' => (int) round($number * 1024 * 1024),
            'm' => (int) round($number * 1024),
            'k' => (int) round($number),
            default => (int) round($number / 1024),
        };
    }
}
