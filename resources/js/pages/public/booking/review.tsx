import PublicLayout from '@/layouts/PublicLayout';
import { Head, useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    booking: {
        id: number;
        booking_code: string;
        full_name: string;
        origin_city: string;
        passenger_count: number;
        package: {
            id: number | null;
            code: string | null;
            slug: string | null;
            name: Record<string, string> | null;
        };
        departure_schedule: {
            id: number | null;
            departure_date: string | null;
            departure_city: string | null;
        };
    };
    existing: {
        id: number;
        name: string;
        origin_city: string | null;
        quote: string;
        photos?: string[] | null;
        rating: number;
    } | null;
};

type FormData = {
    name: string;
    origin_city: string;
    quote: string;
    rating: number;
    photos: File[];
};

function localizeName(value: Record<string, string> | null): string {
    return value?.id ?? value?.en ?? '-';
}

export default function PublicBookingReview({ booking, existing }: Props) {
    const pkgName = localizeName(booking.package.name);
    const scheduleLabel = booking.departure_schedule.departure_date
        ? `${booking.departure_schedule.departure_date}${
              booking.departure_schedule.departure_city
                  ? ` • ${booking.departure_schedule.departure_city}`
                  : ''
          }`
        : '-';

    const form = useForm<FormData>({
        name: existing?.name ?? booking.full_name,
        origin_city: existing?.origin_city ?? booking.origin_city,
        quote: existing?.quote ?? '',
        rating: existing?.rating ?? 5,
        photos: [],
    });

    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            photoPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [photoPreviews]);

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        form.post(window.location.pathname + window.location.search, {
            preserveScroll: true,
            forceFormData: true,
        });
    }

    return (
        <PublicLayout>
            <Head title={`Review ${booking.booking_code}`} />

            <div className="mx-auto w-full max-w-2xl px-4 pt-8 pb-12 sm:px-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <h1 className="public-heading text-2xl font-bold text-foreground">
                        Beri Review
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Booking{' '}
                        <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                            {booking.booking_code}
                        </span>{' '}
                        • {pkgName} • {scheduleLabel}
                    </p>

                    <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground">
                                    Nama Pemesan
                                </p>
                                <p className="font-medium text-foreground">
                                    {booking.full_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Jumlah Pax
                                </p>
                                <p className="font-medium text-foreground">
                                    {booking.passenger_count} pax
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Paket</p>
                                <p className="font-medium text-foreground">
                                    {booking.package.code
                                        ? `${booking.package.code} - ${pkgName}`
                                        : pkgName}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Keberangkatan
                                </p>
                                <p className="font-medium text-foreground">
                                    {scheduleLabel}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Nama
                                </label>
                                <input
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                />
                                {form.errors.name ? (
                                    <p className="text-sm text-destructive">
                                        {form.errors.name}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Kota Asal
                                </label>
                                <input
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.data.origin_city}
                                    onChange={(e) =>
                                        form.setData(
                                            'origin_city',
                                            e.target.value,
                                        )
                                    }
                                />
                                {form.errors.origin_city ? (
                                    <p className="text-sm text-destructive">
                                        {form.errors.origin_city}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Rating
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            form.setData('rating', value)
                                        }
                                        className="rounded-full p-1"
                                        aria-label={`Rating ${value}`}
                                    >
                                        <Star
                                            className={`h-6 w-6 ${
                                                value <= form.data.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-muted-foreground/40'
                                            }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground">
                                    {form.data.rating}/5
                                </span>
                            </div>
                            {form.errors.rating ? (
                                <p className="text-sm text-destructive">
                                    {form.errors.rating}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Testimoni
                            </label>
                            <textarea
                                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.data.quote}
                                onChange={(e) =>
                                    form.setData('quote', e.target.value)
                                }
                                placeholder="Tulis pengalaman kamu..."
                            />
                            {form.errors.quote ? (
                                <p className="text-sm text-destructive">
                                    {form.errors.quote}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Foto (opsional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/80"
                                onChange={(event) => {
                                    const nextFiles = Array.from(
                                        event.target.files ?? [],
                                    ).slice(0, 6);

                                    photoPreviews.forEach((url) =>
                                        URL.revokeObjectURL(url),
                                    );

                                    setPhotoPreviews(
                                        nextFiles.map((file) =>
                                            URL.createObjectURL(file),
                                        ),
                                    );
                                    form.setData('photos', nextFiles);
                                }}
                            />
                            {form.errors.photos ? (
                                <p className="text-sm text-destructive">
                                    {form.errors.photos}
                                </p>
                            ) : null}
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {photoPreviews.map((src, index) => (
                                        <div
                                            key={`${src}-${index}`}
                                            className="aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                                        >
                                            <img
                                                src={src}
                                                alt={`Preview foto ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            {form.processing ? 'Menyimpan…' : 'Kirim Review'}
                        </button>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
