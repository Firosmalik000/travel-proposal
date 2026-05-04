<?php

namespace Tests\Feature\Administrator;

use App\Models\CustomUmrohRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CustomUmrohRequestApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_approve_custom_request_into_booking(): void
    {
        $this->travelTo(Carbon::parse('2026-04-30 10:00:00'));

        $user = User::factory()->create();

        $request = CustomUmrohRequest::query()->create([
            'request_code' => 'CU-TEST-0001',
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

        $this->actingAs($user)
            ->post(route('booking.custom-requests.approve', $request), [
                'passenger_count' => 7,
                'origin_city' => 'Gresik',
                'notes' => 'Override notes untuk booking.',
                'custom_unit_price' => 5000000,
            ])
            ->assertRedirect(route('booking.custom-bookings.index'));

        $this->assertDatabaseHas('bookings', [
            'booking_code' => 'BK-260430-CU0001',
            'booking_type' => 'custom',
            'departure_schedule_id' => null,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '6281234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 7,
            'custom_unit_price' => 5000000,
            'custom_total_amount' => 35000000,
            'notes' => 'Override notes untuk booking.',
            'status' => 'registered',
        ]);

        $this->assertDatabaseHas('custom_umroh_requests', [
            'id' => $request->id,
            'status' => 'approved',
            'approved_by' => $user->id,
        ]);

        $this->travelBack();
    }
}
