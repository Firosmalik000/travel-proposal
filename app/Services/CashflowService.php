<?php

namespace App\Services;

use App\Exceptions\SystemGeneratedCashflowModificationException;
use App\Models\BookingPayment;
use App\Models\Cashflow;
use App\Models\CashflowAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class CashflowService
{
    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, UploadedFile>  $attachments
     */
    public function create(array $payload, array $attachments): Cashflow
    {
        return DB::transaction(function () use ($payload, $attachments): Cashflow {
            $cashflow = Cashflow::query()->create($payload);
            $this->storeAttachments($cashflow, collect($attachments));

            return $cashflow->load('attachments');
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, UploadedFile>  $newAttachments
     * @param  array<int, int>  $deletedAttachmentIds
     */
    public function update(
        Cashflow $cashflow,
        array $payload,
        array $newAttachments = [],
        array $deletedAttachmentIds = [],
        bool $allowEmptyAttachments = false,
    ): Cashflow {
        $this->ensureIsManuallyManaged($cashflow);

        return $this->performUpdate(
            $cashflow,
            $payload,
            $newAttachments,
            $deletedAttachmentIds,
            $allowEmptyAttachments,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function updateFromBookingPayment(Cashflow $cashflow, array $payload): Cashflow
    {
        if ($cashflow->trashed()) {
            $cashflow->restore();
        }

        return $this->performUpdate($cashflow, $payload, [], [], true);
    }

    public function reverseFromBookingPayment(Cashflow $cashflow): void
    {
        if (! $cashflow->trashed()) {
            $cashflow->delete();
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, UploadedFile>  $newAttachments
     * @param  array<int, int>  $deletedAttachmentIds
     */
    private function performUpdate(
        Cashflow $cashflow,
        array $payload,
        array $newAttachments,
        array $deletedAttachmentIds,
        bool $allowEmptyAttachments,
    ): Cashflow {
        return DB::transaction(function () use ($cashflow, $payload, $newAttachments, $deletedAttachmentIds, $allowEmptyAttachments): Cashflow {
            $cashflow->update($payload);

            if ($deletedAttachmentIds !== []) {
                $this->deleteAttachments($cashflow, $deletedAttachmentIds);
            }

            if ($newAttachments !== []) {
                $this->storeAttachments($cashflow, collect($newAttachments));
            }

            if (! $allowEmptyAttachments && $cashflow->attachments()->count() < 1) {
                throw new RuntimeException('Cashflow harus memiliki minimal 1 foto bukti transaksi.');
            }

            return $cashflow->load('attachments');
        });
    }

    public function delete(Cashflow $cashflow): void
    {
        $this->ensureIsManuallyManaged($cashflow);

        DB::transaction(function () use ($cashflow): void {
            $this->deleteAttachments($cashflow, $cashflow->attachments()->pluck('id')->all());
            $cashflow->delete();
        });
    }

    private function ensureIsManuallyManaged(Cashflow $cashflow): void
    {
        $isBookingPaymentCashflow = BookingPayment::query()
            ->withTrashed()
            ->where('cashflow_id', $cashflow->id)
            ->exists();

        if ($isBookingPaymentCashflow) {
            throw new SystemGeneratedCashflowModificationException(
                'Cashflow otomatis dari pembayaran booking hanya dapat dikoreksi melalui halaman Booking Payment.',
            );
        }
    }

    /**
     * @param  Collection<int, UploadedFile>  $attachments
     */
    private function storeAttachments(Cashflow $cashflow, Collection $attachments): void
    {
        $records = $attachments
            ->filter(fn (mixed $file): bool => $file instanceof UploadedFile)
            ->map(function (UploadedFile $file): array {
                $path = $file->store('cashflows', 'public');

                return [
                    'file_path' => '/storage/'.$path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize() ?? 0,
                ];
            })
            ->values()
            ->all();

        if ($records !== []) {
            $cashflow->attachments()->createMany($records);
        }
    }

    /**
     * @param  array<int, int>  $attachmentIds
     */
    private function deleteAttachments(Cashflow $cashflow, array $attachmentIds): void
    {
        $attachments = CashflowAttachment::query()
            ->where('cashflow_id', $cashflow->id)
            ->whereIn('id', $attachmentIds)
            ->get();

        foreach ($attachments as $attachment) {
            if (str_starts_with($attachment->file_path, '/storage/')) {
                $diskPath = substr($attachment->file_path, strlen('/storage/'));
                if ($diskPath !== '') {
                    Storage::disk('public')->delete($diskPath);
                }
            }

            $attachment->delete();
        }
    }
}
