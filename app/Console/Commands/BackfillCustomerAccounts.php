<?php

namespace App\Console\Commands;

use App\Actions\Customer\ResolveCustomerAccount;
use App\Models\Booking;
use App\Models\CustomUmrohRequest;
use App\Models\PackageRegistration;
use App\Services\PackageRoomConfigurationService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BackfillCustomerAccounts extends Command
{
    protected $signature = 'customers:backfill-booking-accounts {--dry-run : Tampilkan jumlah data tanpa mengubah database}';

    protected $description = 'Hubungkan registrasi dan booking lama ke akun customer berdasarkan email';

    public function handle(
        ResolveCustomerAccount $resolveCustomerAccount,
        PackageRoomConfigurationService $roomConfigurationService,
    ): int {
        $sources = [
            'pending registrations' => PackageRegistration::query()->whereNull('customer_id')->whereNotNull('email'),
            'custom requests' => CustomUmrohRequest::query()->whereNull('customer_id')->whereNotNull('email'),
            'bookings' => Booking::query()->whereNull('customer_id')->whereNotNull('email'),
        ];

        foreach ($sources as $label => $query) {
            $this->line(sprintf('%s: %d data', $label, (clone $query)->count()));
        }

        if ($this->option('dry-run')) {
            $this->info('Dry-run selesai. Tidak ada data yang diubah.');

            return self::SUCCESS;
        }

        foreach ($sources as $query) {
            $this->backfill($query, $resolveCustomerAccount, $roomConfigurationService);
        }

        $this->info('Backfill akun customer selesai.');

        return self::SUCCESS;
    }

    /** @param Builder<Model> $query */
    private function backfill(
        Builder $query,
        ResolveCustomerAccount $resolveCustomerAccount,
        PackageRoomConfigurationService $roomConfigurationService,
    ): void {
        if ($query->getModel() instanceof Booking) {
            $query->with('package');
        }

        $query->chunkById(100, function ($records) use ($resolveCustomerAccount, $roomConfigurationService): void {
            foreach ($records as $record) {
                $customer = $resolveCustomerAccount->handle($record->full_name, $record->email, $record->phone);
                $updates = ['customer_id' => $customer->id];

                if ($record instanceof Booking && $record->agreed_total_amount === null) {
                    $updates['agreed_total_amount'] = (int) round($roomConfigurationService->calculateBookingAmount($record));
                    $updates['agreed_currency'] = $record->custom_currency ?? $record->package?->currency ?? 'IDR';
                }

                $record->forceFill($updates)->save();
            }
        });
    }
}
