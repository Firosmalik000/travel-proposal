<?php

namespace App\Services;

use App\Mail\NewPackageRegistrationSubmitted;
use App\Models\PackageRegistration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class BookingRegistrationNotifier
{
    public function notifyAdmin(PackageRegistration $registration): void
    {
        $this->sendEmailNotification($registration);
        $this->sendWhatsAppNotification($registration);
    }

    private function sendEmailNotification(PackageRegistration $registration): void
    {
        $notificationEmail = config('services.booking.notification_email');

        if (! is_string($notificationEmail) || $notificationEmail === '') {
            return;
        }

        rescue(
            fn () => Mail::to($notificationEmail)->send(new NewPackageRegistrationSubmitted($registration)),
            report: true,
        );
    }

    private function sendWhatsAppNotification(PackageRegistration $registration): void
    {
        $token = config('services.booking.whatsapp.token');
        $target = config('services.booking.whatsapp.admin_number');

        if (! is_string($token) || $token === '' || ! is_string($target) || $target === '') {
            return;
        }

        rescue(function () use ($registration, $target, $token): void {
            Http::asForm()
                ->withHeaders([
                    'Authorization' => $token,
                ])
                ->post(config('services.booking.whatsapp.endpoint'), [
                    'target' => $target,
                    'message' => $this->buildWhatsAppMessage($registration),
                    'countryCode' => '62',
                ])
                ->throw();
        }, report: true);
    }

    private function buildWhatsAppMessage(PackageRegistration $registration): string
    {
        $packageName = $registration->travelPackage?->name['id']
            ?? $registration->travelPackage?->code
            ?? 'Paket Umroh';

        $scheduleLabel = $registration->departureSchedule?->departure_date?->translatedFormat('d F Y') ?? '-';
        $departureCity = $registration->departureSchedule?->departure_city ?? '-';

        return implode("\n", [
            'Pendaftaran paket baru masuk.',
            'Nama: '.$registration->full_name,
            'WhatsApp: '.$registration->phone,
            'Email: '.($registration->email ?: '-'),
            'Kota Asal: '.$registration->origin_city,
            'Jumlah Jamaah: '.$registration->passenger_count.' pax',
            'Paket: '.$packageName,
            'Jadwal: '.$scheduleLabel.' - '.$departureCity,
            'Catatan: '.($registration->notes ?: '-'),
        ]);
    }
}
