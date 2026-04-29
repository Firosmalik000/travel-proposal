<?php

declare(strict_types=1);

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreGalleryItemRequest;
use App\Http\Requests\Administrator\UpdateGalleryItemRequest;
use App\Models\GalleryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response
    {
        $items = GalleryItem::query()
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (GalleryItem $item): array => [
                'id' => $item->id,
                'title' => $item->title,
                'category' => $item->category,
                'description' => $item->description,
                'image_path' => $item->image_path,
                'sort_order' => $item->sort_order,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->toDateTimeString(),
            ])
            ->values()
            ->all();

        $stats = [
            'total' => count($items),
            'active' => collect($items)->where('is_active', true)->count(),
            'inactive' => collect($items)->where('is_active', false)->count(),
        ];

        return Inertia::render('Dashboard/WebsiteManagement/Gallery/Index', [
            'items' => $items,
            'stats' => $stats,
        ]);
    }

    public function store(StoreGalleryItemRequest $request): RedirectResponse
    {
        $storedPath = $request->file('image')->store('gallery', 'public');

        GalleryItem::query()->create([
            'title' => $request->string('title')->value(),
            'category' => $request->filled('category') ? $request->string('category')->value() : null,
            'description' => $request->filled('description') ? $request->string('description')->value() : null,
            'image_path' => '/storage/'.$storedPath,
            'sort_order' => $request->integer('sort_order'),
            'is_active' => $request->boolean('is_active'),
        ]);

        return back()->with('success', 'Foto galeri berhasil ditambahkan.');
    }

    public function update(UpdateGalleryItemRequest $request, GalleryItem $galleryItem): RedirectResponse
    {
        $validated = $request->validated();
        $payload = [];

        if (array_key_exists('title', $validated)) {
            $payload['title'] = $request->string('title')->value();
        }

        if (array_key_exists('category', $validated)) {
            $payload['category'] = $request->filled('category') ? $request->string('category')->value() : null;
        }

        if (array_key_exists('description', $validated)) {
            $payload['description'] = $request->filled('description') ? $request->string('description')->value() : null;
        }

        if (array_key_exists('sort_order', $validated)) {
            $payload['sort_order'] = $request->integer('sort_order');
        }

        if (array_key_exists('is_active', $validated)) {
            $payload['is_active'] = $request->boolean('is_active');
        }

        if ($request->hasFile('image')) {
            $payload['image_path'] = '/storage/'.$request->file('image')->store('gallery', 'public');

            $this->deletePublicImage($galleryItem->image_path);
        }

        if ($payload !== []) {
            $galleryItem->update($payload);
        }

        return back()->with('success', 'Foto galeri berhasil diperbarui.');
    }

    public function destroy(GalleryItem $galleryItem): RedirectResponse
    {
        $this->deletePublicImage($galleryItem->image_path);

        $galleryItem->delete();

        return back()->with('success', 'Foto galeri berhasil dihapus.');
    }

    private function deletePublicImage(?string $imagePath): void
    {
        if (! $imagePath) {
            return;
        }

        if (! str_starts_with($imagePath, '/storage/')) {
            return;
        }

        $diskPath = substr($imagePath, strlen('/storage/'));

        if ($diskPath === '') {
            return;
        }

        Storage::disk('public')->delete($diskPath);
    }
}
