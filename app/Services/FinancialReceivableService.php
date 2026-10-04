<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\TravelPackage;
use Carbon\CarbonImmutable;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class FinancialReceivableService
{
    public function __construct(private readonly PackageRoomConfigurationService $roomConfigurationService) {}

    /**
     * @param  array{search:string,package_id:int|null,payment_status:string}  $filters
     * @return array<string, mixed>
     */
    public function build(array $filters, string $paymentPathPrefix): array
    {
        $bookings = Booking::query()
            ->with([
                'package:id,code,name,start_date,currency',
                'payments' => fn ($query) => $query
                    ->with([
                        'financialAccount:id,code,name,account_number',
                        'financialTransactions:id,transaction_type,status,source_type,source_id,amount_original',
                    ])
                    ->latest('payment_date')
                    ->latest('id'),
            ])
            ->where('status', 'registered')
            ->when($filters['package_id'], fn ($query, int $packageId) => $query->where('package_id', $packageId))
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->where('booking_code', 'like', '%'.$search.'%')
                        ->orWhere('full_name', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhereHas('package', fn ($packageQuery) => $packageQuery
                            ->where('code', 'like', '%'.$search.'%'));
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Booking $booking): array => $this->serializeBooking($booking, $paymentPathPrefix));

        $filtered = $bookings
            ->when($filters['payment_status'] !== 'all', function (Collection $rows) use ($filters): Collection {
                if ($filters['payment_status'] === 'overdue') {
                    return $rows->where('is_overdue', true);
                }

                return $rows->where('payment_status', $filters['payment_status']);
            })
            ->values();

        $page = LengthAwarePaginator::resolveCurrentPage();
        $perPage = 20;
        $receivables = new LengthAwarePaginator(
            $filtered->forPage($page, $perPage)->values(),
            $filtered->count(),
            $perPage,
            $page,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => request()->query(),
            ],
        );

        return [
            'receivables' => $receivables,
            'summary' => [
                'bookings' => $filtered->count(),
                'unpaid' => $filtered->where('payment_status', 'unpaid')->count(),
                'partial' => $filtered->where('payment_status', 'partial')->count(),
                'paid' => $filtered->where('payment_status', 'paid')->count(),
                'overdue' => $filtered->where('is_overdue', true)->count(),
                'total_amount_idr' => (int) $filtered->where('currency', 'IDR')->sum('total_amount'),
                'paid_amount_idr' => (int) $filtered->where('currency', 'IDR')->sum('paid_amount'),
                'remaining_amount_idr' => (int) $filtered->where('currency', 'IDR')->sum('remaining_amount'),
                'non_idr_bookings' => $filtered->where('currency', '!=', 'IDR')->count(),
            ],
            'packageOptions' => TravelPackage::query()
                ->whereHas('registrations', fn ($query) => $query->where('status', 'registered'))
                ->orderByDesc('start_date')
                ->get(['id', 'code', 'name'])
                ->map(fn (TravelPackage $package): array => [
                    'id' => $package->id,
                    'code' => $package->code,
                    'name' => (string) (data_get($package->name, 'id') ?? $package->code),
                ])
                ->values()
                ->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function serializeBooking(Booking $booking, string $paymentPathPrefix): array
    {
        $total = (int) ($booking->agreed_total_amount ?: $this->roomConfigurationService->calculateBookingAmount($booking));
        $confirmedPayments = $booking->payments->where('status', 'confirmed');
        $paid = (int) $confirmedPayments->sum(function (BookingPayment $payment): int {
            $refunded = (int) $payment->financialTransactions
                ->where('transaction_type', 'customer_refund')
                ->where('status', 'posted')
                ->sum('amount_original');

            return max(0, (int) $payment->amount - $refunded);
        });
        $remaining = max(0, $total - $paid);
        $paymentStatus = match (true) {
            $paid < 1 => 'unpaid',
            $remaining > 0 => 'partial',
            default => 'paid',
        };
        $dueDate = $booking->custom_departure_date ?? $booking->package?->start_date;
        $isOverdue = $remaining > 0
            && $dueDate !== null
            && CarbonImmutable::parse($dueDate)->isBefore(CarbonImmutable::today('Asia/Jakarta'));
        $lastPayment = $confirmedPayments->sortByDesc('payment_date')->first();

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'customer_name' => $booking->full_name,
            'phone' => $booking->phone,
            'email' => $booking->email,
            'package_code' => $booking->package?->code,
            'package_name' => (string) (data_get($booking->package?->name, 'id') ?? $booking->package?->code ?? 'Paket tidak tersedia'),
            'due_date' => $dueDate?->toDateString(),
            'currency' => strtoupper((string) ($booking->agreed_currency ?? $booking->custom_currency ?? $booking->package?->currency ?? 'IDR')),
            'total_amount' => $total,
            'paid_amount' => $paid,
            'remaining_amount' => $remaining,
            'payment_percentage' => $total > 0 ? min(100, round(($paid / $total) * 100, 1)) : 0,
            'payment_status' => $paymentStatus,
            'is_overdue' => $isOverdue,
            'payments_count' => $confirmedPayments->count(),
            'last_payment_date' => $lastPayment?->payment_date?->toDateString(),
            'last_payment_account' => $lastPayment?->financialAccount
                ? $lastPayment->financialAccount->code.' · '.$lastPayment->financialAccount->name
                : null,
            'payment_url' => rtrim($paymentPathPrefix, '/').'/'.$booking->id.'/payments',
        ];
    }
}
