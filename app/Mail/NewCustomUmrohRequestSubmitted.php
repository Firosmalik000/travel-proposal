<?php

namespace App\Mail;

use App\Models\CustomUmrohRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewCustomUmrohRequestSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CustomUmrohRequest $customUmrohRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Custom Umroh Request Baru: '.$this->customUmrohRequest->full_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.custom-umroh-request-submitted',
        );
    }
}
