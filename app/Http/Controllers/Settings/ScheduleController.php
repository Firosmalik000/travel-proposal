<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateScheduleSettingsRequest;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    private const SETTINGS_SLUG = 'schedule-settings';

    public function edit(): Response
    {
        return Inertia::render('settings/schedule', [
            'settings' => $this->resolveSettings(),
        ]);
    }

    public function update(UpdateScheduleSettingsRequest $request): RedirectResponse
    {
        $settings = PageContent::query()->firstOrCreate(
            ['slug' => self::SETTINGS_SLUG],
            [
                'category' => 'settings',
                'title' => 'Pengaturan Jadwal',
                'excerpt' => 'Pengaturan scheduler untuk proses booking otomatis.',
                'content' => [],
                'is_active' => true,
            ],
        );

        $content = is_array($settings->content) ? $settings->content : [];
        $content['auto_cancellation'] = [
            'enabled' => $request->boolean('auto_cancellation_enabled'),
        ];

        $settings->update([
            'content' => $content,
        ]);

        return back()->with('success', 'Schedule settings berhasil diperbarui.');
    }

    private function resolveSettings(): array
    {
        $settings = PageContent::query()
            ->where('slug', self::SETTINGS_SLUG)
            ->value('content');

        return [
            'auto_cancellation_enabled' => (bool) data_get(
                $settings,
                'auto_cancellation.enabled',
                false,
            ),
        ];
    }
}
