<?php

namespace Tests\Feature\Administrator;

use App\Models\CustomUmrohRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CustomUmrohRequestRejectTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_reject_custom_request(): void
    {
        $this->travelTo(Carbon::parse('2026-04-30 10:00:00'));

        $user = User::factory()->create();

        $request = CustomUmrohRequest::query()->create([
            'request_code' => 'CU-TEST-REJECT-0001',
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
            ->post(route('booking.custom-requests.reject', $request))
            ->assertRedirect();

        $this->assertDatabaseHas('custom_umroh_requests', [
            'id' => $request->id,
            'status' => 'rejected',
            'rejected_by' => $user->id,
        ]);

        $this->assertNotNull(CustomUmrohRequest::query()->find($request->id)?->rejected_at);

        $this->travelBack();
    }

    public function test_it_cannot_reject_approved_custom_request(): void
    {
        $user = User::factory()->create();

        $request = CustomUmrohRequest::query()->create([
            'request_code' => 'CU-TEST-REJECT-0002',
            'full_name' => 'Budi',
            'phone' => '6281234567891',
            'email' => 'budi@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 2,
            'group_type' => 'Keluarga',
            'departure_month' => '2026-07',
            'budget' => 10000000,
            'focus' => 'Hotel dekat',
            'room_preference' => 'Double',
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('booking.custom-requests.reject', $request))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('custom_umroh_requests', [
            'id' => $request->id,
            'status' => 'approved',
            'rejected_by' => null,
        ]);
    }
}
