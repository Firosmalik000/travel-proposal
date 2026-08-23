import { AlertCircle } from 'lucide-react';

export type FormValidationErrors = Record<string, string>;

export function firstValidationMessage(
    errors: FormValidationErrors,
    fallback: string,
): string {
    return Object.values(errors).find(Boolean) ?? fallback;
}

export default function FormValidationSummary({
    errors,
}: {
    errors: FormValidationErrors;
}) {
    const messages = [...new Set(Object.values(errors).filter(Boolean))];

    if (messages.length === 0) {
        return null;
    }

    return (
        <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
            <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                    <p className="font-semibold">Data belum dapat disimpan</p>
                    {messages.slice(0, 5).map((message) => (
                        <p key={message}>{message}</p>
                    ))}
                    {messages.length > 5 ? (
                        <p>
                            {messages.length - 5} kesalahan lainnya perlu
                            diperiksa.
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
