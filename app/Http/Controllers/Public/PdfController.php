<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use App\Models\TravelPackage;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;

class PdfController extends Controller
{
    public function __construct(
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
    ) {}

    /**
     * Render Terms & Conditions as PDF.
     */
    public function termsConditions(Request $request): Response
    {
        return $this->portalPage(slug: 'terms-conditions', request: $request);
    }

    /**
     * Render Privacy Policy as PDF.
     */
    public function privacyPolicy(Request $request): Response
    {
        return $this->portalPage(slug: 'privacy-policy', request: $request);
    }

    /**
     * Render Refund Policy as PDF.
     */
    public function refundPolicy(Request $request): Response
    {
        return $this->portalPage(slug: 'refund-policy', request: $request);
    }

    /**
     * Render Disclaimer as PDF.
     */
    public function disclaimer(Request $request): Response
    {
        return $this->portalPage(slug: 'disclaimer', request: $request);
    }

    /**
     * Render a portal page (Terms/Privacy/Refund/Disclaimer) as PDF.
     */
    private function portalPage(string $slug, Request $request): Response
    {
        $allowedSlugs = ['terms-conditions', 'privacy-policy', 'refund-policy', 'disclaimer'];
        abort_unless(in_array($slug, $allowedSlugs, true), 404);

        $locale = $this->localeFromRequest($request);
        $download = $request->boolean('download');

        /** @var PageContent|null $page */
        $page = PageContent::query()
            ->where('category', 'page')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        abort_if($page === null, 404);

        $generatedAt = now();
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        return $this->renderPdf(
            view: 'pdf.portal-page',
            data: [
                'locale' => $locale,
                'branding' => $branding,
                'seo' => $seo,
                'title' => $this->localize($page->title, $locale, 'Policy'),
                'excerpt' => $this->localize($page->excerpt, $locale, ''),
                'bodyHtml' => $this->localize(Arr::get($page->content, 'body'), $locale, ''),
                'generatedAt' => $generatedAt,
            ],
            filename: $this->safeFilename($slug.'-'.$locale.'.pdf'),
            download: $download,
        );
    }

    /**
     * Render "SK Paket" (package policy summary) as PDF for customers.
     */
    public function packageSk(TravelPackage $travelPackage, Request $request): Response
    {
        abort_unless((bool) $travelPackage->is_active, 404);

        $locale = $this->localeFromRequest($request);
        $download = $request->boolean('download');
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();
        $content = is_array($travelPackage->content) ? $travelPackage->content : [];
        $included = $this->toStringArray($content['included'][$locale] ?? $content['included']['id'] ?? null);
        $excluded = $this->toStringArray($content['excluded'][$locale] ?? $content['excluded']['id'] ?? null);
        $policy = $this->localize($content['policy'] ?? null, $locale, '');
        $generatedAt = now();

        return $this->renderPdf(
            view: 'pdf.package-sk',
            data: [
                'locale' => $locale,
                'branding' => $branding,
                'seo' => $seo,
                'package' => $travelPackage,
                'name' => $this->localize($travelPackage->name, $locale, $travelPackage->slug),
                'summary' => $this->localize($travelPackage->summary, $locale, ''),
                'included' => $included,
                'excluded' => $excluded,
                'policy' => $policy,
                'generatedAt' => $generatedAt,
            ],
            filename: $this->safeFilename('sk-'.$travelPackage->slug.'-'.$locale.'.pdf'),
            download: $download,
        );
    }

    private function localeFromRequest(Request $request): string
    {
        $locale = strtolower((string) $request->query('lang', 'id'));

        return in_array($locale, ['id', 'en'], true) ? $locale : 'id';
    }

    private function localize(mixed $value, string $locale, string $fallback): string
    {
        if (is_string($value)) {
            return trim($value) !== '' ? $value : $fallback;
        }

        if (is_array($value)) {
            $preferred = (string) ($value[$locale] ?? '');
            $alternate = (string) ($value[$locale === 'id' ? 'en' : 'id'] ?? '');
            $preferred = trim($preferred);
            $alternate = trim($alternate);
            if ($preferred !== '') {
                return $preferred;
            }

            return $fallback !== '' ? $fallback : $alternate;
        }

        return $fallback;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function renderPdf(string $view, array $data, string $filename, bool $download): Response
    {
        if ($download) {
            return $this->pdfRenderer->renderDownload(
                view: $view,
                data: $data,
                filename: $filename,
                mpdfConfig: [
                    'margin_top' => 18,
                    'margin_bottom' => 18,
                    'margin_left' => 14,
                    'margin_right' => 14,
                ],
            );
        }

        return $this->pdfRenderer->renderInline(
            view: $view,
            data: $data,
            filename: $filename,
            mpdfConfig: [
                'margin_top' => 18,
                'margin_bottom' => 18,
                'margin_left' => 14,
                'margin_right' => 14,
            ],
        );
    }

    private function safeFilename(string $name): string
    {
        return preg_replace('/[^A-Za-z0-9._-]+/', '-', $name) ?: 'document.pdf';
    }

    /**
     * @return array<int, string>
     */
    private function toStringArray(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value), fn (string $v) => trim($v) !== ''));
        }

        if (is_string($value)) {
            return array_values(array_filter(array_map('trim', preg_split('/\\r\\n|\\r|\\n/', $value) ?: [])));
        }

        return [];
    }
}
