<?php

namespace Tests\Feature\Public;

use App\Mail\NewCustomUmrohRequestSubmitted;
use App\Models\CustomUmrohRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomUmrohRequestStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_custom_umroh_request_from_public_form(): void
    {
        Mail::fake();
        Http::fake();

        config()->set('services.booking.notification_email', 'admin@example.com');
        config()->set('services.booking.whatsapp.endpoint', 'https://api.example.test/send');
        config()->set('services.booking.whatsapp.admin_number', '6281234567890');
        config()->set('services.booking.whatsapp.token', 'test-token');

        $this->post(route('public.custom.store'), [
            'full_name' => 'Ahmad Fauzi',
            'phone' => '6281234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 6,
            'group_type' => 'Keluarga',
            'departure_month' => '2026-07',
            'budget' => 35000000,
            'focus' => 'Hotel lebih dekat',
            'room_preference' => 'Triple',
            'notes' => 'Ada lansia 2 orang.',
        ])->assertRedirect(route('public.custom'));

        $this->assertDatabaseCount('custom_umroh_requests', 1);

        $request = CustomUmrohRequest::query()->firstOrFail();

        $this->assertSame('new', $request->status);
        $this->assertNotEmpty($request->request_code);

        $this->assertDatabaseHas('custom_umroh_requests', [
            'id' => $request->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '6281234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 6,
            'group_type' => 'Keluarga',
            'departure_month' => '2026-07',
            'budget' => 35000000,
            'focus' => 'Hotel lebih dekat',
            'room_preference' => 'Triple',
            'notes' => 'Ada lansia 2 orang.',
            'status' => 'new',
        ]);

        Mail::assertSent(NewCustomUmrohRequestSubmitted::class, function (NewCustomUmrohRequestSubmitted $mail) use ($request): bool {
            return $mail->customUmrohRequest->is($request);
        });

        Http::assertSentCount(1);
    }
}
