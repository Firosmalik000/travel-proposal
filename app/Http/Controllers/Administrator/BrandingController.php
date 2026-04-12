<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\UpdateBrandingRequest;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Administrator/Branding/Index', [
            'branding' => $this->resolveBrandingSettings(),
        ]);
    }

    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $settings = PageContent::query()->firstOrCreate(
            ['slug' => 'branding-settings'],
            [
                'title' => 'Branding Settings',
                'excerpt' => 'Brand palette and logo overrides for portal and public pages.',
                'content' => [],
                'is_active' => true,
            ],
        );

        $content = is_array($settings->content) ? $settings->content : [];
        $content['company_name'] = $request->string('company_name')->value();
        $content['company_subtitle'] = $request->string('company_subtitle')->value();
        $content['palette'] = [
            'primary' => $request->string('primary')->value(),
            'secondary' => $request->string('secondary')->value(),
            'accent' => $request->string('accent')->value(),
            'accent_soft' => $request->string('accent_soft')->value(),
            'surface' => $request->string('surface')->value(),
        ];

        if ($request->hasFile('logo')) {
            $currentLogoPath = $content['logo_path'] ?? null;
            if ($currentLogoPath) {
                Storage::disk('public')->delete($currentLogoPath);
            }

            $content['logo_path'] = $request->file('logo')->store('branding', 'public');
        }

        if ($request->hasFile('logo_white')) {
            $currentLogoWhitePath = $content['logo_white_path'] ?? null;
            if ($currentLogoWhitePath) {
                Storage::disk('public')->delete($currentLogoWhitePath);
            }

            $content['logo_white_path'] = $request->file('logo_white')->store('branding', 'public');
        }

        $settings->update(['content' => $content]);

        return redirect()->back()->with('success', 'Branding berhasil diperbarui');
    }

    private function resolveBrandingSettings(): array
    {
        $defaults = [
            'company_name' => config('branding.company_name'),
            'company_subtitle' => config('branding.company_subtitle'),
            'logo_path' => config('branding.logo_path'),
            'logo_white_path' => config('branding.logo_white_path'),
            'palette' => config('branding.palette'),
        ];

        $overrides = PageContent::query()
            ->where('slug', 'branding-settings')
            ->value('content');

        if (! is_array($overrides)) {
            return $defaults;
        }

        return [
            'company_name' => $overrides['company_name'] ?? $defaults['company_name'],
            'company_subtitle' => $overrides['company_subtitle'] ?? $defaults['company_subtitle'],
            'logo_path' => isset($overrides['logo_path']) ? '/storage/'.$overrides['logo_path'] : $defaults['logo_path'],
            'logo_white_path' => isset($overrides['logo_white_path']) ? '/storage/'.$overrides['logo_white_path'] : $defaults['logo_white_path'],
            'palette' => array_merge($defaults['palette'], is_array($overrides['palette'] ?? null) ? $overrides['palette'] : []),
        ];
    }
}
