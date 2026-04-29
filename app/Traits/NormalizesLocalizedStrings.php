<?php

namespace App\Traits;

trait NormalizesLocalizedStrings
{
    protected function normalizeLocalizedString(mixed $value): string
    {
        if (is_string($value)) {
            return $value;
        }

        if (is_array($value)) {
            return (string) ($value['id'] ?? $value['en'] ?? '');
        }

        return '';
    }

    protected function normalizeNullableLocalizedString(mixed $value): ?string
    {
        $normalized = trim($this->normalizeLocalizedString($value));

        return $normalized !== '' ? $normalized : null;
    }
}
