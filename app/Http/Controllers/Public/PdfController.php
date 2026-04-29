<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Administrator\SeoController;
use App\Http\Controllers\Controller;
use App\Models\PageContent;
use App\Models\TravelPackage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Mpdf\Mpdf;

class PdfController extends Controller
{
    /**      * Render Terms & Conditions as PDF.      */
    public function termsConditions(Request $request): Response
    {
        return $this->portalPage(slug: 'terms-conditions', request: $request);
    }

    /**      * Render Privacy Policy as PDF.      */
    public function privacyPolicy(Request $request): Response
    {
        return $this->portalPage(slug: 'privacy-policy', request: $request);
    }

    /**      * Render Refund Policy as PDF.      */
    public function refundPolicy(Request $request): Response
    {
        return $this->portalPage(slug: 'refund-policy', request: $request);
    }

    /**      * Render Disclaimer as PDF.      */
    public function disclaimer(Request $request): Response
    {
        return $this->portalPage(slug: 'disclaimer', request: $request);
    }

    /**      * Render a portal page (Terms/Privacy/Refund/Disclaimer) as PDF.      */
    private function portalPage(string $slug, Request $request): Response
    {
        $allowedSlugs = ['terms-conditions',             'privacy-policy',             'refund-policy',             'disclaimer'];
        abort_unless(in_array($slug, $allowedSlugs, true), 404);
        $locale = $this->localeFromRequest($request);
        $download = $request->boolean('download');
        /** @var PageContent|null $page */ $page = PageContent::query()->where('category', 'page')->where('slug', $slug)->where('is_active', true)->first();
        abort_if($page === null, 404);
        $branding = $this->brandingForPdf();
        $seo = SeoController::getPublicSettings();
        $title = $this->localize($page->title, $locale, 'Policy');
        $excerpt = $this->localize($page->excerpt, $locale, '');
        $bodyHtml = $this->localize(Arr::get($page->content, 'body'), $locale, '');
        $html = view('pdf.portal-page', ['locale' => $locale,             'branding' => $branding,             'seo' => $seo,             'title' => $title,             'excerpt' => $excerpt,             'bodyHtml' => $bodyHtml,             'generatedAt' => now()])->render();

        return $this->renderPdf(html: $html, filename: $this->safeFilename($slug.'-'.$locale.'.pdf'), download: $download);
    }

    /**      * Render "SK Paket" (package policy summary) as PDF for customers.      */
    public function packageSk(TravelPackage $travelPackage, Request $request): Response
    {
        abort_unless((bool) $travelPackage->is_active, 404);
        $locale = $this->localeFromRequest($request);
        $download = $request->boolean('download');
        $branding = $this->brandingForPdf();
        $seo = SeoController::getPublicSettings();
        $content = is_array($travelPackage->content) ? $travelPackage->content : [];
        $included = $this->toStringArray($content['included'][$locale] ?? $content['included']['id'] ?? null);
        $excluded = $this->toStringArray($content['excluded'][$locale] ?? $content['excluded']['id'] ?? null);
        $policy = $this->localize($content['policy'] ?? null, $locale, '');
        $html = view('pdf.package-sk', ['locale' => $locale,             'branding' => $branding,             'seo' => $seo,             'package' => $travelPackage,             'name' => $this->localize($travelPackage->name, $locale, $travelPackage->slug),             'summary' => $this->localize($travelPackage->summary, $locale, ''),             'included' => $included,             'excluded' => $excluded,             'policy' => $policy,             'generatedAt' => now()])->render();

        return $this->renderPdf(html: $html, filename: $this->safeFilename('sk-'.$travelPackage->slug.'-'.$locale.'.pdf'), download: $download);
    }

    private function renderPdf(string $html, string $filename, bool $download): Response
    {
        $tmpDir = storage_path('app/mpdf');
        if (! is_dir($tmpDir)) {
            @mkdir($tmpDir, 0775, true);
        }          $mpdf = new Mpdf(['mode' => 'utf-8',             'format' => 'A4',             'tempDir' => $tmpDir,             'default_font' => 'dejavusans',             'margin_top' => 18,             'margin_bottom' => 18,             'margin_left' => 14,             'margin_right' => 14]);
        $mpdf->SetTitle($filename);
        $mpdf->WriteHTML($html);
        /** @var string $pdf */ $pdf = $mpdf->Output('', 'S');

        return response($pdf, 200, ['Content-Type' => 'application/pdf',             'Content-Disposition' => ($download ? 'attachment' : 'inline').'; filename="'.$filename.'"',             'Cache-Control' => 'private, max-age=0, must-revalidate',             'Pragma' => 'public']);
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
        }          if (is_array($value)) {
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

    /**      * @return array{company_name:string, company_subtitle:string, logo_data_uri:string|null, palette:array<string,mixed>}      */
    private function brandingForPdf(): array
    {
        $defaults = ['company_name' => (string) config('branding.company_name'),             'company_subtitle' => (string) config('branding.company_subtitle'),             'logo_path' => (string) config('branding.logo_path'),             'palette' => (array) config('branding.palette', [])];
        $overrides = PageContent::query()->where('slug', 'branding-settings')->value('content');
        $overrides = is_array($overrides) ? $overrides : [];
        $logoDataUri = $this->logoDataUriFromSeoOrBranding(seo: SeoController::getPublicSettings(), brandingLogoPath: (string) ($overrides['logo_path'] ?? $defaults['logo_path']));

        return ['company_name' => (string) ($overrides['company_name'] ?? $defaults['company_name']),             'company_subtitle' => (string) ($overrides['company_subtitle'] ?? $defaults['company_subtitle']),             'logo_data_uri' => $logoDataUri,             'palette' => array_merge($defaults['palette'], is_array($overrides['palette'] ?? null) ? $overrides['palette'] : [])];
    }

    private function logoDataUriFromSeoOrBranding(array $seo, string $brandingLogoPath): ?string
    {
        $seoLogoUrl = (string) data_get($seo, 'contact.logo.url', '');
        $seoLogoPath = (string) data_get($seo, 'contact.logo.path', '');
        /* Prefer stored SEO logo when available. */ if ($seoLogoPath !== '' && Storage::disk('public')->exists($seoLogoPath)) {
            return $this->fileToDataUri(Storage::disk('public')->path($seoLogoPath));
        }          /* Branding override might be a storage path (without /storage) or a public path. */ $brandingLogoPath = ltrim($brandingLogoPath, '/');
        if (str_starts_with($brandingLogoPath, 'storage/')) {
            $diskPath = substr($brandingLogoPath, strlen('storage/'));
            if (Storage::disk('public')->exists($diskPath)) {
                return $this->fileToDataUri(Storage::disk('public')->path($diskPath));
            }
        }          $publicCandidate = public_path($brandingLogoPath);
        if (is_file($publicCandidate)) {
            return $this->fileToDataUri($publicCandidate);
        }          /* Last attempt: if SEO has URL but no path, try to resolve it against public/. */ if ($seoLogoUrl !== '') {
            $maybePublic = public_path(ltrim(parse_url($seoLogoUrl, PHP_URL_PATH) ?: '', '/'));
            if (is_file($maybePublic)) {
                return $this->fileToDataUri($maybePublic);
            }
        }

        return null;
    }

    private function fileToDataUri(string $path): ?string
    {
        if (! is_file($path)) {
            return null;
        }          $bytes = @file_get_contents($path);
        if ($bytes === false) {
            return null;
        }          $mime = 'image/png';
        if (class_exists(\finfo::class)) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $detected = $finfo->file($path);
            if (is_string($detected) && $detected !== '') {
                $mime = $detected;
            }
        }

        return 'data:'.$mime.';base64,'.base64_encode($bytes);
    }

    private function safeFilename(string $name): string
    {
        return preg_replace('/[^A-Za-z0-9._-]+/', '-', $name) ?: 'document.pdf';
    }

    /**      * @return array<int, string>      */
    private function toStringArray(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value), fn (string $v) => trim($v) !== ''));
        }          if (is_string($value)) {
            return array_values(array_filter(array_map('trim', preg_split('/\\r\\n|\\r|\\n/', $value) ?: [])));
        }

        return [];
    }
}
