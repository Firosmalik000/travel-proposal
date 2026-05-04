<?php

namespace Tests\Feature\Public;

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class PublicBookingReviewPhotosTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_review_with_multiple_photos(): void
    {
        $diskRoot = sys_get_temp_dir().DIRECTORY_SEPARATOR.'travel-propposal-public-disk';
        File::ensureDirectoryExists($diskRoot);
        config()->set('filesystems.disks.public.root', $diskRoot);

        $package = TravelPackage::query()->create([
            'code' => 'ASF-REV-10',
            'slug' => 'umroh-review-10',
            'name' => ['id' => 'Umroh Review 10', 'en' => 'Umrah Review 10'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 1000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-06-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260430-0007',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $signedUrl = URL::temporarySignedRoute(
            'public.booking.review.store',
            now()->addMinutes(5),
            ['booking' => $booking->booking_code],
        );

        $this->post($signedUrl, [
            'name' => 'Ahmad Fauzi',
            'origin_city' => 'Gresik',
            'quote' => 'Sangat puas.',
            'rating' => 5,
            'photos' => [
                UploadedFile::fake()->image('foto-1.jpg'),
                UploadedFile::fake()->image('foto-2.jpg'),
            ],
        ])->assertRedirect(route('public.testimoni'));

        $this->assertDatabaseHas('testimonials', [
            'booking_id' => $booking->id,
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'rating' => 5,
        ]);

        $testimonial = $booking->fresh()->testimonial()->firstOrFail();
        $this->assertIsArray($testimonial->photos);
        $this->assertCount(2, $testimonial->photos);
    }
}
