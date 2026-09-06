<?php

namespace App\Services;

use App\Actions\Customer\ResolveCustomerAccount;
use App\Jobs\SendParticipantDataWhatsAppReminder;
use App\Models\Booking;
use Illuminate\Validation\ValidationException;

class BookingParticipantReminderService
{
    public function __construct(
        private readonly BookingParticipantCompletenessService $completenessService,
        private readonly ResolveCustomerAccount $resolveCustomerAccount,
    ) {}

    /**
     * @return array{is_complete:bool,can_remind:bool,can_send_direct:bool,whatsapp_url:?string,outstanding_count:int,incomplete_participants_count:int,remaining_slots:int,missing_fields_count:int,missing_documents_count:int}
     */
    public function details(Booking $booking): array
    {
        $booking->loadMissing(['package:id,code,name', 'participants']);

        $summary = $this->completenessService->bookingSummary($booking);
        $target = $this->normalizedTarget($booking->phone);
        $canRemind = $booking->status !== 'cancelled'
            && ! $summary['is_complete']
            && $target !== null;

        return [
            'is_complete' => (bool) $summary['is_complete'],
            'can_remind' => $canRemind,
            'can_send_direct' => $canRemind && $this->directSendingIsConfigured(),
            'whatsapp_url' => $canRemind
                ? 'https://wa.me/'.$target.'?text='.rawurlencode($this->message($booking, $summary))
                : null,
            'outstanding_count' => (int) $summary['outstanding_count'],
            'incomplete_participants_count' => (int) $summary['incomplete_participants_count'],
            'remaining_slots' => (int) $summary['remaining_slots'],
            'missing_fields_count' => (int) $summary['missing_fields_count'],
            'missing_documents_count' => (int) $summary['missing_documents_count'],
        ];
    }

    public function queue(Booking $booking): void
    {
        $details = $this->details($booking);

        if ($details['is_complete']) {
            throw ValidationException::withMessages([
                'reminder' => 'Data peserta booking ini sudah lengkap.',
            ]);
        }

        if ($booking->status === 'cancelled') {
            throw ValidationException::withMessages([
                'reminder' => 'Reminder tidak dapat dikirim untuk booking yang dibatalkan.',
            ]);
        }

        $target = $this->normalizedTarget($booking->phone);

        if ($target === null) {
            throw ValidationException::withMessages([
                'reminder' => 'Nomor WhatsApp booking belum valid.',
            ]);
        }

        if (! $this->directSendingIsConfigured()) {
            throw ValidationException::withMessages([
                'reminder' => 'Pengiriman WhatsApp langsung belum diaktifkan.',
            ]);
        }

        SendParticipantDataWhatsAppReminder::dispatch(
            $target,
            $this->message($booking, $this->completenessService->bookingSummary($booking)),
        );
    }

    /**
     * @param  array<string, int|bool>  $summary
     */
    private function message(Booking $booking, array $summary): string
    {
        $packageName = data_get($booking->package?->name, 'id')
            ?? $booking->package?->code
            ?? 'Paket Umroh';
        $participantUrl = route('customer.bookings.show', [
            'bookingCode' => $booking->booking_code,
        ]).'?tab=participants';

        return implode("\n", [
            'Assalamu’alaikum Bapak/Ibu '.$booking->full_name.',',
            '',
            'Kami dari Asfar Tour mengingatkan bahwa data peserta untuk booking *'.$booking->booking_code.'* ('.$packageName.') belum lengkap.',
            '',
            'Rincian yang perlu dilengkapi:',
            '• Peserta belum diisi: '.$summary['remaining_slots'],
            '• Peserta belum lengkap: '.$summary['incomplete_participants_count'],
            '• Biodata belum lengkap: '.$summary['missing_fields_count'],
            '• Dokumen belum lengkap: '.$summary['missing_documents_count'],
            '',
            'Silakan lengkapi melalui:',
            $participantUrl,
            '',
            'Terima kasih.',
        ]);
    }

    private function normalizedTarget(?string $phone): ?string
    {
        $target = $this->resolveCustomerAccount->normalizePhone((string) $phone);

        return preg_match('/^62[1-9][0-9]{7,13}$/', $target) === 1 ? $target : null;
    }

    private function directSendingIsConfigured(): bool
    {
        return (bool) config('services.booking.whatsapp.direct_enabled')
            && filled(config('services.booking.whatsapp.token'))
            && filled(config('services.booking.whatsapp.endpoint'));
    }
}
