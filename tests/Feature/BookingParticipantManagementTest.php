<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookingParticipantManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_participants_for_a_booking(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.view');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260606-0001',
            'package_id' => $package->id,
            'full_name' => 'Firos Malik Abdillah',
            'phone' => '081234567890',
            'origin_city' => 'Probolinggo',
            'passenger_count' => 3,
            'status' => 'registered',
        ]);

        BookingParticipant::query()->create([
            'booking_id' => $booking->id,
            'full_name' => 'Jamaah Pertama',
            'gender' => 'male',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.participants.index', $booking))
            ->assertOk()
            ->assertJson([
                'booking' => [
                    'id' => $booking->id,
                    'booking_code' => 'BK-260606-0001',
                    'passenger_count' => 3,
                    'participants_count' => 1,
                    'remaining_slots' => 2,
                ],
            ])
            ->assertJsonPath('participants.0.full_name', 'Jamaah Pertama');
    }

    public function test_it_stores_booking_participant_and_detects_passport_validity(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260606-0002',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Utama',
            'phone' => '081200000001',
            'origin_city' => 'Surabaya',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->post(route('booking.listing.participants.store', $booking), [
                'full_name' => 'Jamaah Kedua',
                'gender' => 'female',
                'passport_ready' => true,
                'passport_issue_date' => '2020-06-01',
                'passport_expiry_date' => '2025-06-01',
                'passport_type' => 'ordinary',
                'passport_scan' => UploadedFile::fake()->create('passport.pdf', 200, 'application/pdf'),
                'marriage_book_scan' => UploadedFile::fake()->create('marriage-book.pdf', 200, 'application/pdf'),
                'photo' => UploadedFile::fake()->image('photo.jpg'),
                'has_medical_history' => true,
                'medical_history_notes' => 'Asma ringan',
            ])
            ->assertRedirect();

        $participant = BookingParticipant::query()->firstOrFail();

        $this->assertSame($booking->id, $participant->booking_id);
        $this->assertSame('Jamaah Kedua', $participant->full_name);
        $this->assertSame(5, $participant->passport_validity_years);
        $this->assertNotNull($participant->passport_scan_path);
        $this->assertNotNull($participant->marriage_book_scan_path);
        $this->assertNotNull($participant->photo_path);
        $this->assertMatchesRegularExpression(
            '#^/storage/booking-participants/'.$booking->id.'/scan-paspor-bk-260606-0002-\d{14}\.pdf$#',
            (string) $participant->passport_scan_path,
        );
        $this->assertMatchesRegularExpression(
            '#^/storage/booking-participants/'.$booking->id.'/buku-nikah-bk-260606-0002-\d{14}\.pdf$#',
            (string) $participant->marriage_book_scan_path,
        );
        $this->assertMatchesRegularExpression(
            '#^/storage/booking-participants/'.$booking->id.'/pas-foto-bk-260606-0002-\d{14}\.jpg$#',
            (string) $participant->photo_path,
        );

        Storage::disk('public')->assertExists(
            substr((string) $participant->passport_scan_path, strlen('/storage/')),
        );
        Storage::disk('public')->assertExists(
            substr((string) $participant->marriage_book_scan_path, strlen('/storage/')),
        );
        Storage::disk('public')->assertExists(
            substr((string) $participant->photo_path, strlen('/storage/')),
        );
    }

    public function test_it_prevents_adding_participants_beyond_booking_pax_limit(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260606-0003',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Penuh',
            'phone' => '081200000002',
            'origin_city' => 'Malang',
            'passenger_count' => 1,
            'status' => 'registered',
        ]);

        BookingParticipant::query()->create([
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Sudah Ada',
        ]);

        $response = $this->actingAs($user)
            ->from(route('booking.listing.index'))
            ->post(route('booking.listing.participants.store', $booking), [
                'full_name' => 'Peserta Baru',
            ])
            ->assertRedirect(route('booking.listing.index'));

        $this->assertDatabaseCount('booking_participants', 1);
        $response->assertSessionHasErrors('full_name');
    }

    public function test_it_updates_and_deletes_booking_participant(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260606-0004',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Update',
            'phone' => '081200000003',
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $storedPath = UploadedFile::fake()
            ->create('passport-old.pdf', 100, 'application/pdf')
            ->store('booking-participants', 'public');

        $participant = BookingParticipant::query()->create([
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Lama',
            'passport_scan_path' => '/storage/'.$storedPath,
        ]);

        $this->actingAs($user)
            ->put(route('booking.listing.participants.update', [
                'registration' => $booking,
                'participant' => $participant,
            ]), [
                'full_name' => 'Peserta Update',
                'passport_issue_date' => '2016-01-01',
                'passport_expiry_date' => '2026-01-01',
                'passport_scan' => UploadedFile::fake()->create('passport-new.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect();

        $participant->refresh();

        $this->assertSame('Peserta Update', $participant->full_name);
        $this->assertSame(10, $participant->passport_validity_years);
        Storage::disk('public')->assertMissing($storedPath);
        $this->assertMatchesRegularExpression(
            '#^/storage/booking-participants/'.$booking->id.'/scan-paspor-bk-260606-0004-\d{14}\.pdf$#',
            (string) $participant->passport_scan_path,
        );

        $newStoredPath = substr((string) $participant->passport_scan_path, strlen('/storage/'));
        Storage::disk('public')->assertExists($newStoredPath);

        $this->actingAs($user)
            ->delete(route('booking.listing.participants.destroy', [
                'registration' => $booking,
                'participant' => $participant,
            ]))
            ->assertRedirect();

        $this->assertDatabaseMissing('booking_participants', [
            'id' => $participant->id,
        ]);
        Storage::disk('public')->assertMissing($newStoredPath);
    }

    public function test_it_keeps_existing_document_when_replacement_url_cannot_be_resolved(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260608-0002',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Dokumen Aman',
            'phone' => '081200000009',
            'origin_city' => 'Depok',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        Storage::disk('public')->put(
            'booking-participants/existing/scan-paspor-lama.pdf',
            'passport-existing-content',
        );

        $participant = BookingParticipant::query()->create([
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Existing',
            'passport_scan_path' => '/storage/booking-participants/existing/scan-paspor-lama.pdf',
        ]);

        $this->actingAs($user)
            ->put(route('booking.listing.participants.update', [
                'registration' => $booking,
                'participant' => $participant,
            ]), [
                'full_name' => 'Peserta Existing',
                'passport_scan_url' => '/storage/booking-participants/source/tidak-ada.pdf',
            ])
            ->assertRedirect();

        $participant->refresh();

        $this->assertSame(
            '/storage/booking-participants/existing/scan-paspor-lama.pdf',
            $participant->passport_scan_path,
        );
        Storage::disk('public')->assertExists(
            'booking-participants/existing/scan-paspor-lama.pdf',
        );
    }

    public function test_it_rejects_participant_file_above_php_upload_limit(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260607-0001',
            'package_id' => $package->id,
            'full_name' => 'Pemesan File Besar',
            'phone' => '081200000004',
            'origin_city' => 'Bandung',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $response = $this->actingAs($user)
            ->from(route('booking.listing.index'))
            ->post(route('booking.listing.participants.store', $booking), [
                'full_name' => 'Peserta Upload Besar',
                'marriage_book_scan' => UploadedFile::fake()->create(
                    'buku-nikah.pdf',
                    2500,
                    'application/pdf',
                ),
            ])
            ->assertRedirect(route('booking.listing.index'));

        $response->assertSessionHasErrors('marriage_book_scan');
        $this->assertDatabaseCount('booking_participants', 0);
    }

    public function test_it_imports_booking_participants_from_bulk_payload(): void
    {
        Storage::fake('public');
        Http::fake([
            'https://files.example.test/*' => Http::response('fake-image', 200, [
                'Content-Type' => 'image/jpeg',
            ]),
        ]);

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260607-0002',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Import',
            'phone' => '081200000005',
            'origin_city' => 'Semarang',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $response = $this->actingAs($user)
            ->postJson(route('booking.listing.participants.import', $booking), [
                'participants' => [
                    [
                        'full_name' => 'Peserta Import 1',
                        'gender' => 'male',
                        'passport_ready' => true,
                        'passport_issue_date' => '2020-01-01',
                        'passport_expiry_date' => '2030-01-01',
                        'passport_type' => 'ordinary',
                        'has_performed_umrah' => true,
                        'passport_scan_url' => 'https://files.example.test/passport.jpg',
                        'photo_url' => 'https://files.example.test/photo.jpg',
                    ],
                    [
                        'full_name' => 'Peserta Import 2',
                        'gender' => 'female',
                        'needs_wheelchair' => true,
                    ],
                    [
                        'full_name' => 'Peserta Import 3',
                    ],
                ],
            ]);

        $response->assertOk()
            ->assertJsonPath('created_count', 2)
            ->assertJsonPath('skipped_rows.0.name', 'Peserta Import 3');

        $this->assertDatabaseCount('booking_participants', 2);
        $this->assertDatabaseHas('booking_participants', [
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Import 1',
            'passport_validity_years' => 10,
        ]);
        $this->assertDatabaseHas('booking_participants', [
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Import 2',
            'needs_wheelchair' => true,
        ]);
        $participant = BookingParticipant::query()
            ->where('booking_id', $booking->id)
            ->where('full_name', 'Peserta Import 1')
            ->firstOrFail();
        $this->assertNotNull($participant->passport_scan_path);
        $this->assertNotNull($participant->photo_path);
        Storage::disk('public')->assertExists(
            substr((string) $participant->passport_scan_path, strlen('/storage/')),
        );
        Storage::disk('public')->assertExists(
            substr((string) $participant->photo_path, strlen('/storage/')),
        );
    }

    public function test_it_imports_booking_participants_from_exported_storage_paths(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260607-0004',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Export Path',
            'phone' => '081200000007',
            'origin_city' => 'Yogyakarta',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        Storage::disk('public')->put(
            'booking-participants/source/pas-foto-sumber.jpg',
            'fake-photo-content',
        );

        $this->actingAs($user)
            ->postJson(route('booking.listing.participants.import', $booking), [
                'participants' => [
                    [
                        'full_name' => 'Peserta Exported',
                        'photo_url' => '/storage/booking-participants/source/pas-foto-sumber.jpg',
                    ],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('created_count', 1);

        $participant = BookingParticipant::query()
            ->where('booking_id', $booking->id)
            ->where('full_name', 'Peserta Exported')
            ->firstOrFail();

        $this->assertNotNull($participant->photo_path);
        Storage::disk('public')->assertExists(
            substr((string) $participant->photo_path, strlen('/storage/')),
        );
    }

    public function test_it_stores_booking_participant_from_document_url_source(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260608-0001',
            'package_id' => $package->id,
            'full_name' => 'Pemesan URL Source',
            'phone' => '081200000008',
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        Storage::disk('public')->put(
            'booking-participants/source/scan-paspor-sumber.pdf',
            'fake-passport-content',
        );

        $this->actingAs($user)
            ->post(route('booking.listing.participants.store', $booking), [
                'full_name' => 'Peserta URL Manual',
                'passport_scan_url' => '/storage/booking-participants/source/scan-paspor-sumber.pdf',
            ])
            ->assertRedirect();

        $participant = BookingParticipant::query()
            ->where('booking_id', $booking->id)
            ->where('full_name', 'Peserta URL Manual')
            ->firstOrFail();

        $this->assertNotNull($participant->passport_scan_path);
        Storage::disk('public')->assertExists(
            substr((string) $participant->passport_scan_path, strlen('/storage/')),
        );
    }

    public function test_it_validates_bulk_participant_import_payload(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');
        $package = TravelPackage::factory()->create();

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260607-0003',
            'package_id' => $package->id,
            'full_name' => 'Pemesan Invalid',
            'phone' => '081200000006',
            'origin_city' => 'Solo',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->postJson(route('booking.listing.participants.import', $booking), [
                'participants' => [
                    [
                        'full_name' => '',
                    ],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['participants.0.full_name']);
    }
}
