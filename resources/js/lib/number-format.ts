export function formatDecimalInput(
    value: string | number | null | undefined,
    precision = 2,
): string {
    const numericValue = Number(value ?? 0);

    return Number.isFinite(numericValue)
        ? numericValue.toFixed(precision)
        : (0).toFixed(precision);
}

export function formatIdr(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
