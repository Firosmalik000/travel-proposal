<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingReviewRequest;
use App\Models\Booking;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BookingReviewController extends Controller
{
    public function show(Booking $booking): Response
    {
        $booking->loadMissing([
            'package:id,code,slug,name',
            'departureSchedule:id,package_id,departure_date,departure_city',
        ]);

        return Inertia::render('public/booking/review', [
            'booking' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'full_name' => $booking->full_name,
                'origin_city' => $booking->origin_city,
                'passenger_count' => $booking->passenger_count,
                'package' => [
                    'id' => $booking->package?->id,
                    'code' => $booking->package?->code,
                    'slug' => $booking->package?->slug,
                    'name' => $booking->package?->name,
                ],
                'departure_schedule' => [
                    'id' => $booking->departureSchedule?->id,
                    'departure_date' => $booking->departureSchedule?->departure_date?->toDateString(),
                    'departure_city' => $booking->departureSchedule?->departure_city,
                ],
            ],
            'existing' => Testimonial::query()
                ->where('booking_id', $booking->id)
                ->first(['id', 'name', 'origin_city', 'quote', 'photos', 'rating']),
        ]);
    }

    public function store(StoreBookingReviewRequest $request, Booking $booking)
    {
        abort_unless($booking->status === 'registered', 404);

        $existingPhotos = Testimonial::query()
            ->where('booking_id', $booking->id)
            ->value('photos');

        $uploadedPhotos = [];
        $photoFiles = $request->file('photos', []);
        if (is_array($photoFiles)) {
            foreach ($photoFiles as $photoFile) {
                if (! $photoFile) {
                    continue;
                }

                $path = Storage::disk('public')->putFile('testimonials', $photoFile);
                $uploadedPhotos[] = "/storage/{$path}";
            }
        }

        $nextPhotos = collect(is_array($existingPhotos) ? $existingPhotos : [])
            ->merge($uploadedPhotos)
            ->filter(fn ($value) => is_string($value) && trim($value) !== '')
            ->unique()
            ->values()
            ->take(6)
            ->all();

        $testimonial = Testimonial::query()->updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'package_id' => $booking->package_id,
                'departure_schedule_id' => $booking->departure_schedule_id,
                'name' => $request->string('name')->value(),
                'origin_city' => $request->filled('origin_city')
                    ? $request->string('origin_city')->value()
                    : null,
                'quote' => $request->string('quote')->value(),
                'photos' => $nextPhotos,
                'rating' => $request->integer('rating'),
                'is_active' => true,
                'is_featured' => false,
            ],
        );

        return redirect()
            ->route('public.testimoni')
            ->with('success', "Terima kasih! Testimoni kamu tersimpan (ID: {$testimonial->id}).");
    }
}
