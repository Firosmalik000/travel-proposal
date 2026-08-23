export type DateValue = Date | string | number | null | undefined;

export interface DateFormatOptions {
    fallback?: string;
    withDay?: boolean;
}

export interface DateTimeFormatOptions extends DateFormatOptions {
    withSeconds?: boolean;
}

export interface TimeFormatOptions {
    fallback?: string;
    withSeconds?: boolean;
}

export interface MonthFormatOptions {
    fallback?: string;
    withYear?: boolean;
}

const INDONESIAN_LOCALE = 'id-ID';
const INDONESIAN_TIME_ZONE = 'Asia/Jakarta';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateValue(value: DateValue): Date | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string') {
        const dateOnlyMatch = value.match(DATE_ONLY_PATTERN);

        if (dateOnlyMatch) {
            const [, year, month, day] = dateOnlyMatch;
            const date = new Date(
                Date.UTC(Number(year), Number(month) - 1, Number(day), 12),
            );

            return Number.isNaN(date.getTime()) ? null : date;
        }
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
    value: DateValue,
    options: DateFormatOptions = {},
): string {
    const date = parseDateValue(value);

    if (!date) {
        return options.fallback ?? '-';
    }

    return new Intl.DateTimeFormat(INDONESIAN_LOCALE, {
        weekday: options.withDay ? 'long' : undefined,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: INDONESIAN_TIME_ZONE,
    }).format(date);
}

export function formatDateWithDay(
    value: DateValue,
    options: Omit<DateFormatOptions, 'withDay'> = {},
): string {
    return formatDate(value, { ...options, withDay: true });
}

export function formatMonth(
    value: DateValue,
    options: MonthFormatOptions = {},
): string {
    const date = parseDateValue(value);

    if (!date) {
        return options.fallback ?? '-';
    }

    return new Intl.DateTimeFormat(INDONESIAN_LOCALE, {
        month: 'long',
        year: options.withYear ? 'numeric' : undefined,
        timeZone: INDONESIAN_TIME_ZONE,
    }).format(date);
}

export function formatDateTime(
    value: DateValue,
    options: DateTimeFormatOptions = {},
): string {
    const date = parseDateValue(value);

    if (!date) {
        return options.fallback ?? '-';
    }

    return new Intl.DateTimeFormat(INDONESIAN_LOCALE, {
        weekday: options.withDay ? 'long' : undefined,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: options.withSeconds ? '2-digit' : undefined,
        hourCycle: 'h23',
        timeZone: INDONESIAN_TIME_ZONE,
        timeZoneName: 'short',
    }).format(date);
}

export function formatTime(
    value: DateValue,
    options: TimeFormatOptions = {},
): string {
    const date = parseDateValue(value);

    if (!date) {
        return options.fallback ?? '-';
    }

    return new Intl.DateTimeFormat(INDONESIAN_LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        second: options.withSeconds ? '2-digit' : undefined,
        hourCycle: 'h23',
        timeZone: INDONESIAN_TIME_ZONE,
    }).format(date);
}

export function formatDateRange(
    startDate: DateValue,
    endDate: DateValue,
    options: DateFormatOptions = {},
): string {
    const fallback = options.fallback ?? '-';
    const formattedStartDate = formatDate(startDate, { ...options, fallback });
    const formattedEndDate = formatDate(endDate, { ...options, fallback });

    if (formattedStartDate === fallback && formattedEndDate === fallback) {
        return fallback;
    }

    if (formattedStartDate === formattedEndDate) {
        return formattedStartDate;
    }

    if (formattedStartDate === fallback) {
        return formattedEndDate;
    }

    if (formattedEndDate === fallback) {
        return formattedStartDate;
    }

    return `${formattedStartDate} - ${formattedEndDate}`;
}
