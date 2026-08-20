<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Services\BookingParticipantCompletenessService;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class BookingParticipantCompletenessServiceTest extends TestCase
{
    public function test_it_uses_the_same_strict_result_for_participant_and_booking_summaries(): void
    {
        $service = app(BookingParticipantCompletenessService::class);
        $participant = new BookingParticipant([
            'full_name' => 'Peserta Contoh',
            'gender' => 'male',
            'passport_ready' => true,
            'passport_scan_path' => 'booking-participants/1/passport.pdf',
        ]);
        $booking = new Booking(['passenger_count' => 2]);
        $booking->setRelation('participants', new Collection([$participant]));

        $participantResult = $service->analyze($participant);
        $bookingResult = $service->bookingSummary($booking);

        $this->assertFalse($participantResult['is_complete']);
        $this->assertSame(1, $participantResult['documents_count']);
        $this->assertSame(6, $participantResult['documents_total']);
        $this->assertGreaterThan(0, $participantResult['missing_count']);
        $this->assertFalse($bookingResult['is_complete']);
        $this->assertSame(1, $bookingResult['remaining_slots']);
        $this->assertSame(0, $bookingResult['complete_participants_count']);
        $this->assertSame(
            $participantResult['missing_count'] + 1,
            $bookingResult['outstanding_count'],
        );
    }

    public function test_it_marks_a_participant_complete_only_when_every_requirement_exists(): void
    {
        $service = app(BookingParticipantCompletenessService::class);
        $participant = new BookingParticipant([
            'full_name' => 'Peserta Lengkap',
            'gender' => 'female',
            'birth_place' => 'Bandung',
            'birth_date' => '1990-05-10',
            'marital_status' => 'married',
            'address' => 'Bandung',
            'shirt_size' => 'M',
            'passport_ready' => true,
            'passport_issue_date' => '2024-01-01',
            'passport_expiry_date' => '2029-01-01',
            'passport_type' => 'ordinary',
            'emergency_contact_name' => 'Keluarga',
            'emergency_contact_phone' => '628123456789',
            'emergency_contact_relationship' => 'Saudara',
            'passport_scan_path' => 'passport.pdf',
            'family_card_scan_path' => 'family-card.pdf',
            'marriage_book_scan_path' => 'marriage-book.pdf',
            'birth_certificate_scan_path' => 'birth-certificate.pdf',
            'photo_path' => 'photo.jpg',
            'meningitis_vaccine_scan_path' => 'vaccine.pdf',
        ]);

        $result = $service->analyze($participant);

        $this->assertTrue($result['is_complete']);
        $this->assertSame(0, $result['missing_count']);
        $this->assertSame(6, $result['documents_count']);
    }
}
