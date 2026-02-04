<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InterviewReschedule extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $recipientName,
        public string $recipientType, // 'kandidat' or 'interviewer'
        public string $namaKandidat,
        public string $posisiDilamar,
        public string $tglInterviewOld,
        public string $tglInterviewNew,
        public string $statusInterview,
        public ?string $linkMeet,
        public ?string $namaInterviewerHrd = null,
        public ?string $namaInterviewerUser = null,
        public ?string $emailKandidat = null,
        public ?string $roleInterviewer = null,
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reschedule Jadwal Interview - ' . $this->namaKandidat . ' (' . $this->posisiDilamar . ')',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.interview-reschedule',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
