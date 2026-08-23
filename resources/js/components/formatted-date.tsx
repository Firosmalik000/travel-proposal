import { formatDate, formatDateTime, type DateValue } from '@/lib/date-format';
import type { HTMLAttributes } from 'react';

interface FormattedDateProps extends HTMLAttributes<HTMLTimeElement> {
    fallback?: string;
    showDay?: boolean;
    showTime?: boolean;
    value: DateValue;
}

export default function FormattedDate({
    value,
    fallback,
    showDay = false,
    showTime = false,
    ...props
}: FormattedDateProps) {
    const label = showTime
        ? formatDateTime(value, { fallback, withDay: showDay })
        : formatDate(value, { fallback, withDay: showDay });
    const dateTime =
        value instanceof Date ? value.toISOString() : String(value ?? '');

    return (
        <time dateTime={dateTime || undefined} {...props}>
            {label}
        </time>
    );
}
