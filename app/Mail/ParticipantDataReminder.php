<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParticipantDataReminder extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, int|bool>  $summary
     */
    public function __construct(
        public Booking $booking,
        public array $summary,
        public string $participantsUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Lengkapi Data Peserta {$this->booking->booking_code}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.participant-data-reminder');
    }
}
