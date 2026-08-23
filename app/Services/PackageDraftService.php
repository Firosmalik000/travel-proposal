<?php

namespace App\Services;

use App\Models\PackageDraft;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PackageDraftService
{
    private const EXPIRY_DAYS = 30;

    /** @var array<int, string> */
    private const PAYLOAD_KEYS = [
        'slug',
        'name',
        'package_type',
        'departure_city',
        'start_date',
        'end_date',
        'seats_total',
        'booking_status',
        'departure_notes',
        'duration_days',
        'price',
        'original_price',
        'discount_percent',
        'discount_label',
        'discount_ends_at',
        'currency',
        'summary',
        'content',
        'itineraries',
        'product_ids',
        'product_multipliers',
        'custom_products',
        'all_in',
        'is_featured',
        'is_active',
        'refresh_currency_rates',
        'existing_images',
    ];

    public function findForUser(User $user, ?TravelPackage $package = null): ?PackageDraft
    {
        $this->purgeExpiredForUser($user);

        return PackageDraft::query()
            ->where('user_id', $user->id)
            ->where('draft_key', $this->draftKey($package))
            ->first();
    }

    /** @return Collection<int, PackageDraft> */
    public function allForUser(User $user): Collection
    {
        $this->purgeExpiredForUser($user);

        return PackageDraft::query()
            ->with('package:id,updated_at')
            ->where('user_id', $user->id)
            ->orderByDesc('last_autosaved_at')
            ->get();
    }

    /** @param array<string, mixed> $payload */
    public function upsert(User $user, array $payload, ?TravelPackage $package = null): PackageDraft
    {
        $sanitizedPayload = Arr::only($payload, self::PAYLOAD_KEYS);

        return DB::transaction(function () use ($user, $package, $sanitizedPayload): PackageDraft {
            $draft = PackageDraft::query()
                ->where('user_id', $user->id)
                ->where('draft_key', $this->draftKey($package))
                ->lockForUpdate()
                ->first();

            if ($draft === null) {
                $draft = new PackageDraft([
                    'user_id' => $user->id,
                    'package_id' => $package?->id,
                    'draft_key' => $this->draftKey($package),
                    'temporary_images' => [],
                    'base_package_updated_at' => $package?->updated_at,
                ]);
            }

            $draft->fill([
                'payload' => $sanitizedPayload,
                'last_autosaved_at' => now(),
                'expires_at' => now()->addDays(self::EXPIRY_DAYS),
            ])->save();

            return $draft->refresh();
        });
    }

    /**
     * @param array<int, UploadedFile> $images
     * @return array<int, array<string, mixed>>
     */
    public function uploadImages(User $user, array $images, ?TravelPackage $package = null): array
    {
        $draft = $this->findForUser($user, $package)
            ?? $this->upsert($user, [], $package);
        $temporaryImages = collect($draft->temporary_images ?? []);

        if ($temporaryImages->count() + count($images) > 30) {
            throw ValidationException::withMessages([
                'images' => 'Maksimal 30 gambar dapat disimpan pada satu draft package.',
            ]);
        }

        foreach ($images as $image) {
            $imageId = (string) Str::uuid();
            $extension = strtolower($image->extension() ?: 'jpg');
            $storedPath = $image->storeAs(
                "package-drafts/{$user->id}/{$draft->id}",
                "{$imageId}.{$extension}",
                'public',
            );

            $temporaryImages->push([
                'id' => $imageId,
                'path' => '/storage/'.$storedPath,
                'original_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
            ]);
        }

        $draft->update([
            'temporary_images' => $temporaryImages->values()->all(),
            'last_autosaved_at' => now(),
            'expires_at' => now()->addDays(self::EXPIRY_DAYS),
        ]);

        return $draft->fresh()->temporary_images ?? [];
    }

    public function deleteImage(User $user, string $imageId, ?TravelPackage $package = null): PackageDraft
    {
        $draft = $this->findForUser($user, $package);
        if ($draft === null) {
            abort(404);
        }

        $temporaryImages = collect($draft->temporary_images ?? []);
        $image = $temporaryImages->firstWhere('id', $imageId);
        if (! is_array($image)) {
            abort(404);
        }

        Storage::disk('public')->delete($this->storagePath((string) $image['path']));
        $draft->update([
            'temporary_images' => $temporaryImages
                ->reject(fn (mixed $item): bool => is_array($item) && ($item['id'] ?? null) === $imageId)
                ->values()
                ->all(),
            'last_autosaved_at' => now(),
        ]);

        return $draft->refresh();
    }

    public function discard(User $user, ?TravelPackage $package = null): void
    {
        $draft = $this->findForUser($user, $package);

        if ($draft !== null) {
            $this->deleteDraft($draft);
        }
    }

    public function discardAllForPackage(TravelPackage $package): void
    {
        PackageDraft::query()
            ->where('package_id', $package->id)
            ->get()
            ->each(fn (PackageDraft $draft) => $this->deleteDraft($draft));
    }

    /**
     * @param array<int, string> $submittedImages
     * @return array{images: array<int, string>, promoted_paths: array<int, string>}
     */
    public function prepareImagesForSave(
        User $user,
        array $submittedImages,
        ?TravelPackage $package = null,
    ): array {
        $draft = $this->findForUser($user, $package);
        $temporaryImages = collect($draft?->temporary_images ?? [])->keyBy('path');
        $allowedPackageImages = collect($package === null ? [] : [
            $package->image_path,
            ...data_get($package->content, 'gallery', []),
        ])->filter()->unique();
        $resolvedImages = [];
        $promotedPaths = [];

        try {
            foreach (collect($submittedImages)->filter()->unique() as $submittedImage) {
                $submittedImage = (string) $submittedImage;
                if ($allowedPackageImages->contains($submittedImage)) {
                    $resolvedImages[] = $submittedImage;

                    continue;
                }

                $temporaryImage = $temporaryImages->get($submittedImage);
                if (! is_array($temporaryImage)) {
                    throw ValidationException::withMessages([
                        'existing_images' => 'Salah satu gambar draft tidak valid atau bukan milik Anda.',
                    ]);
                }

                $sourcePath = $this->storagePath((string) $temporaryImage['path']);
                if (! Storage::disk('public')->exists($sourcePath)) {
                    throw ValidationException::withMessages([
                        'existing_images' => 'File gambar draft sudah tidak tersedia. Upload ulang gambar tersebut.',
                    ]);
                }

                $extension = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
                $targetPath = 'packages/'.Str::uuid().'.'.$extension;
                if (! Storage::disk('public')->copy($sourcePath, $targetPath)) {
                    throw ValidationException::withMessages([
                        'existing_images' => 'Gambar draft gagal dipindahkan. Coba simpan kembali.',
                    ]);
                }

                $promotedPaths[] = $targetPath;
                $resolvedImages[] = '/storage/'.$targetPath;
            }
        } catch (Throwable $exception) {
            $this->removePromotedImages($promotedPaths);

            throw $exception;
        }

        return [
            'images' => $resolvedImages,
            'promoted_paths' => $promotedPaths,
        ];
    }

    /** @param array<int, string> $promotedPaths */
    public function removePromotedImages(array $promotedPaths): void
    {
        Storage::disk('public')->delete($promotedPaths);
    }

    /** @return array<string, mixed> */
    public function serialize(PackageDraft $draft): array
    {
        $package = $draft->package;
        $hasConflict = $package !== null
            && $draft->base_package_updated_at !== null
            && ! $package->updated_at?->equalTo($draft->base_package_updated_at);

        return [
            'id' => $draft->id,
            'package_id' => $draft->package_id,
            'payload' => $draft->payload ?? [],
            'temporary_images' => $draft->temporary_images ?? [],
            'base_package_updated_at' => $draft->base_package_updated_at?->toIso8601String(),
            'last_autosaved_at' => $draft->last_autosaved_at?->toIso8601String(),
            'expires_at' => $draft->expires_at?->toIso8601String(),
            'has_conflict' => $hasConflict,
        ];
    }

    /** @return array<string, mixed> */
    public function serializeSummary(PackageDraft $draft): array
    {
        $serialized = $this->serialize($draft);

        return Arr::only($serialized, [
            'id',
            'package_id',
            'last_autosaved_at',
            'expires_at',
            'has_conflict',
        ]) + [
            'name' => trim((string) data_get($draft->payload, 'name.id'))
                ?: trim((string) data_get($draft->payload, 'name.en'))
                ?: 'Package baru belum diberi nama',
        ];
    }

    private function purgeExpiredForUser(User $user): void
    {
        PackageDraft::query()
            ->where('user_id', $user->id)
            ->where('expires_at', '<=', now())
            ->get()
            ->each(fn (PackageDraft $draft) => $this->deleteDraft($draft));
    }

    private function deleteDraft(PackageDraft $draft): void
    {
        Storage::disk('public')->deleteDirectory(
            "package-drafts/{$draft->user_id}/{$draft->id}",
        );
        $draft->delete();
    }

    private function draftKey(?TravelPackage $package): string
    {
        return $package === null ? 'create' : 'package:'.$package->id;
    }

    private function storagePath(string $publicPath): string
    {
        return Str::after($publicPath, '/storage/');
    }
}
