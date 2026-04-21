<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreActivityRequest;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->string('search')->value());

        $activities = Activity::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name->id', 'like', "%{$search}%")
                    ->orWhere('name->en', 'like', "%{$search}%")
                    ->orWhere('description->id', 'like', "%{$search}%")
                    ->orWhere('description->en', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Activity $activity) => [
                'id' => $activity->id,
                'code' => $activity->code,
                'name' => $activity->name ?? [],
                'description' => $activity->description ?? [],
                'sort_order' => $activity->sort_order,
                'is_active' => $activity->is_active,
                'created_at' => $activity->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Dashboard/ProductManagement/Activities/Index', [
            'activities' => $activities,
            'filters' => [
                'search' => $search,
            ],
            'stats' => [
                'total' => Activity::query()->count(),
                'active' => Activity::query()->where('is_active', true)->count(),
                'inactive' => Activity::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(StoreActivityRequest $request): RedirectResponse
    {
        $name = $this->normalizeLocalizedPayload($request->input('name', []));
        $description = $this->normalizeLocalizedPayload(
            $request->input('description', []),
        );

        Activity::query()->create([
            'code' => $this->generateActivityCode($name),
            'name' => $name,
            'description' => $description,
            'sort_order' => $request->integer('sort_order', 1),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Activity berhasil ditambahkan.');
    }

    public function update(StoreActivityRequest $request, Activity $activity): RedirectResponse
    {
        $name = $this->normalizeLocalizedPayload($request->input('name', []));
        $description = $this->normalizeLocalizedPayload(
            $request->input('description', []),
        );

        $activity->update([
            'code' => $this->generateActivityCode($name, $activity),
            'name' => $name,
            'description' => $description,
            'sort_order' => $request->integer('sort_order', 1),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Activity berhasil diperbarui.');
    }

    public function destroy(Activity $activity): RedirectResponse
    {
        $activity->delete();

        return back()->with('success', 'Activity berhasil dihapus.');
    }

    /**
     * @param  array{id?: string, en?: string}  $name
     */
    private function generateActivityCode(array $name, ?Activity $ignore = null): string
    {
        $source = trim((string) ($name['id'] ?? '')) ?: trim((string) ($name['en'] ?? ''));
        $normalized = Str::upper(Str::slug($source, '-'));
        $normalized = $normalized !== '' ? Str::limit($normalized, 42, '') : 'ACTIVITY';

        $baseCode = 'ACT-'.$normalized;
        $candidate = $baseCode;
        $suffix = 2;

        while (
            Activity::query()
                ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->getKey()))
                ->where('code', $candidate)
                ->exists()
        ) {
            $candidate = Str::limit($baseCode, 46, '').'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    /**
     * @param  array{id?: string, en?: string}  $value
     * @return array{id: string, en: string}
     */
    private function normalizeLocalizedPayload(array $value): array
    {
        $indonesian = trim((string) ($value['id'] ?? ''));
        $english = trim((string) ($value['en'] ?? ''));

        return [
            'id' => $indonesian,
            'en' => $english !== '' ? $english : $indonesian,
        ];
    }
}
