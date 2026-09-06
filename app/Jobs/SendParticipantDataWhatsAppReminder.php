<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class SendParticipantDataWhatsAppReminder implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(
        public readonly string $target,
        public readonly string $message,
    ) {}

    public function handle(): void
    {
        Http::asForm()
            ->withHeaders([
                'Authorization' => (string) config('services.booking.whatsapp.token'),
            ])
            ->connectTimeout(5)
            ->timeout(15)
            ->post((string) config('services.booking.whatsapp.endpoint'), [
                'target' => $this->target,
                'message' => $this->message,
                'countryCode' => '62',
            ])
            ->throw();
    }
}
