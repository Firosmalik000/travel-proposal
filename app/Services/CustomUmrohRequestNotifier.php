<?php

namespace App\Services;

use App\Mail\NewCustomUmrohRequestSubmitted;
use App\Models\CustomUmrohRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class CustomUmrohRequestNotifier
{
    public function notifyAdmin(CustomUmrohRequest $customUmrohRequest): void
    {
        $this->sendEmailNotification($customUmrohRequest);
        $this->sendWhatsAppNotification($customUmrohRequest);
    }

    private function sendEmailNotification(CustomUmrohRequest $customUmrohRequest): void
    {
        $notificationEmail = config('services.notifications.admin_email');

        if (! is_string($notificationEmail) || $notificationEmail === '') {
            return;
        }

        rescue(
            fn () => Mail::to($notificationEmail)->send(new NewCustomUmrohRequestSubmitted($customUmrohRequest)),
            report: true,
        );
    }

    private function sendWhatsAppNotification(CustomUmrohRequest $customUmrohRequest): void
    {
        $token = config('services.booking.whatsapp.token');
        $target = config('services.booking.whatsapp.admin_number');

        if (! is_string($token) || $token === '' || ! is_string($target) || $target === '') {
            return;
        }

        rescue(function () use ($customUmrohRequest, $target, $token): void {
            Http::asForm()
                ->withHeaders([
                    'Authorization' => $token,
                ])
                ->post(config('services.booking.whatsapp.endpoint'), [
                    'target' => $target,
                    'message' => $this->buildWhatsAppMessage($customUmrohRequest),
                    'countryCode' => '62',
                ])
                ->throw();
        }, report: true);
    }

    private function buildWhatsAppMessage(CustomUmrohRequest $customUmrohRequest): string
    {
        $budget = $customUmrohRequest->budget !== null
            ? number_format((int) $customUmrohRequest->budget, 0, ',', '.')
            : '-';

        return implode("\n", [
            'Custom request umroh baru masuk.',
            'Kode: '.$customUmrohRequest->request_code,
            'Nama: '.$customUmrohRequest->full_name,
            'WhatsApp: '.$customUmrohRequest->phone,
            'Email: '.($customUmrohRequest->email ?: '-'),
            'Kota Asal: '.$customUmrohRequest->origin_city,
            'Jumlah Jamaah: '.$customUmrohRequest->passenger_count.' pax',
            'Tipe: '.$customUmrohRequest->group_type,
            'Bulan: '.$customUmrohRequest->departure_month,
            'Budget: '.$budget,
            'Focus: '.$customUmrohRequest->focus,
            'Kamar: '.$customUmrohRequest->room_preference,
            'Catatan: '.($customUmrohRequest->notes ?: '-'),
        ]);
    }
}
