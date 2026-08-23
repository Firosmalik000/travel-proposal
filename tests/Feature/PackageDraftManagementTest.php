<?php

use App\Models\PackageDraft;
use App\Models\TravelPackage;
use App\Models\User;
use App\Services\PackageDraftService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function packageForDraftTest(array $overrides = []): TravelPackage
{
    return TravelPackage::factory()->create(array_merge([
        'slug' => 'package-draft-test',
        'start_date' => '2026-09-01',
        'end_date' => '2026-09-10',
        'seats_total' => 35,
        'seats_available' => 35,
        'booking_status' => 'open',
        'image_path' => null,
        'content' => [],
    ], $overrides));
}

function validPackageUpdatePayload(TravelPackage $package, array $overrides = []): array
{
    return array_merge([
        'slug' => $package->slug,
        'name' => 'Package Draft Tersimpan',
        'package_type' => 'reguler',
        'departure_city' => 'Jakarta',
        'start_date' => '2026-09-01',
        'end_date' => '2026-09-10',
        'seats_total' => 35,
        'booking_status' => 'open',
        'duration_days' => 10,
        'price' => 30_000_000,
        'currency' => 'IDR',
        'content' => [],
        'itineraries' => [],
        'product_ids' => [],
        'product_multipliers' => [],
        'custom_products' => [],
        'all_in' => ['enabled' => false],
        'is_featured' => false,
        'is_active' => true,
    ], $overrides);
}

it('stores create drafts per user and restores them on the create page', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $payload = [
        'name' => ['id' => 'Umroh Draft Aman', 'en' => 'Safe Draft Umrah'],
        'price' => 31_000_000,
        'discount_percent' => 10,
        'is_featured' => true,
        'all_in' => ['enabled' => false, 'included_category_keys' => []],
    ];

    $this->actingAs($owner)
        ->putJson(route('packages.drafts.create.upsert'), ['payload' => $payload])
        ->assertOk()
        ->assertJsonPath('draft.payload.name.id', 'Umroh Draft Aman')
        ->assertJsonPath('draft.payload.price', 31_000_000)
        ->assertJsonPath('draft.payload.is_featured', true);

    $this->actingAs($owner)
        ->get(route('packages.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('draft.payload.name.id', 'Umroh Draft Aman')
            ->where('draft.package_id', null));

    $this->actingAs($otherUser)
        ->get(route('packages.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('draft', null));

    expect(PackageDraft::query()->count())->toBe(1);
});

it('shows edit draft summaries and reports package version conflicts', function () {
    $user = User::factory()->create();
    $package = packageForDraftTest();

    $this->actingAs($user)
        ->putJson(route('packages.drafts.edit.upsert', $package), [
            'payload' => [
                'name' => ['id' => 'Nama dari Draft'],
                'departure_city' => 'Surabaya',
            ],
        ])
        ->assertOk()
        ->assertJsonPath('draft.has_conflict', false);

    $package->forceFill(['updated_at' => now()->addMinute()])->saveQuietly();

    $this->actingAs($user)
        ->get(route('packages.edit', $package))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('draft.payload.name.id', 'Nama dari Draft')
            ->where('draft.has_conflict', true));

    $this->actingAs($user)
        ->get(route('packages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('packageDrafts', 1)
            ->where('packageDrafts.0.package_id', $package->id)
            ->where('packageDrafts.0.has_conflict', true)
            ->where('createDraft', null));
});

it('keeps temporary draft images private to their owner and removes them on discard', function () {
    Storage::fake('public');
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $uploadResponse = $this->actingAs($owner)
        ->withHeader('Accept', 'application/json')
        ->post(route('packages.drafts.create.images.store'), [
            'images' => [UploadedFile::fake()->image('cover.jpg', 1200, 800)],
        ])
        ->assertOk();

    $imageId = $uploadResponse->json('draft.temporary_images.0.id');
    $imagePath = $uploadResponse->json('draft.temporary_images.0.path');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $imagePath));

    $this->actingAs($otherUser)
        ->deleteJson(route('packages.drafts.create.images.destroy', $imageId))
        ->assertNotFound();

    expect(fn () => app(PackageDraftService::class)->prepareImagesForSave(
        $otherUser,
        [$imagePath],
    ))->toThrow(ValidationException::class);

    $this->actingAs($owner)
        ->deleteJson(route('packages.drafts.create.destroy'))
        ->assertOk();

    Storage::disk('public')->assertMissing(str_replace('/storage/', '', $imagePath));
    $this->assertDatabaseMissing('package_drafts', ['user_id' => $owner->id]);
});

it('promotes draft images and clears the edit draft only after final save succeeds', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $package = packageForDraftTest();

    $uploadResponse = $this->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post(route('packages.drafts.edit.images.store', $package), [
            'images' => [UploadedFile::fake()->image('gallery.jpg', 1000, 1000)],
        ])
        ->assertOk();
    $temporaryPath = $uploadResponse->json('draft.temporary_images.0.path');

    $this->actingAs($user)
        ->putJson(route('packages.drafts.edit.upsert', $package), [
            'payload' => [
                'name' => ['id' => 'Package Draft Tersimpan'],
                'existing_images' => [$temporaryPath],
            ],
        ])
        ->assertOk();

    $this->actingAs($user)
        ->post(route('packages.update', $package), validPackageUpdatePayload($package, [
            'existing_images' => [$temporaryPath],
        ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $package->refresh();
    expect($package->image_path)
        ->toStartWith('/storage/packages/')
        ->and(PackageDraft::query()->where('package_id', $package->id)->exists())
        ->toBeFalse();
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $package->image_path));
    Storage::disk('public')->assertMissing(str_replace('/storage/', '', $temporaryPath));
});

it('retains the draft and temporary image when final package validation fails', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $package = packageForDraftTest();
    $uploadResponse = $this->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post(route('packages.drafts.edit.images.store', $package), [
            'images' => [UploadedFile::fake()->image('kept.jpg')],
        ])
        ->assertOk();
    $temporaryPath = $uploadResponse->json('draft.temporary_images.0.path');

    $this->actingAs($user)
        ->post(route('packages.update', $package), validPackageUpdatePayload($package, [
            'name' => '',
            'existing_images' => [$temporaryPath],
        ]))
        ->assertSessionHasErrors('name');

    $this->assertDatabaseHas('package_drafts', [
        'user_id' => $user->id,
        'package_id' => $package->id,
    ]);
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $temporaryPath));
});

it('rejects malformed or oversized draft payloads', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->putJson(route('packages.drafts.create.upsert'), [
            'payload' => ['duration_days' => 0],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('payload.duration_days');

    $this->actingAs($user)
        ->putJson(route('packages.drafts.create.upsert'), [
            'payload' => ['summary' => ['id' => str_repeat('x', 2_100_000)]],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('payload');
});

it('requires authentication for package draft endpoints', function () {
    $this->putJson(route('packages.drafts.create.upsert'), ['payload' => []])
        ->assertUnauthorized();
});
