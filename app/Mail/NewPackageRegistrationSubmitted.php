<?php

namespace App\Mail;

use App\Models\PackageRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewPackageRegistrationSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PackageRegistration $registration) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pendaftaran Paket Baru: '.$this->registration->full_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.package-registration-submitted',
        );
    }
}
