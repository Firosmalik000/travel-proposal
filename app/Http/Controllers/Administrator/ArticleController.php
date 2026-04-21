<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreArticleRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => (string) $request->string('search')->value(),
            'status' => (string) $request->string('status')->value(),
            'content_type' => (string) $request->string('content_type')->value(),
            'featured' => (string) $request->string('featured')->value(),
        ];

        $articles = Article::query()
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = Str::lower($filters['search']);

                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->whereRaw('LOWER(slug) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(author_name) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, "$.id"))) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, "$.en"))) like ?', ["%{$search}%"]);
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['content_type'] !== '', fn ($query) => $query->where('content_type', $filters['content_type']))
            ->when($filters['featured'] !== '', fn ($query) => $query->where('is_featured', $filters['featured'] === 'yes'))
            ->latest('published_at')
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Article $article): array => $this->serializeForAdmin($article));

        return Inertia::render('Dashboard/WebsiteManagement/Articles/Index', [
            'articles' => $articles,
            'filters' => $filters,
            'contentTypeOptions' => $this->contentTypeOptions(),
            'statusOptions' => $this->statusOptions(),
            'stats' => [
                'total' => Article::query()->count(),
                'published' => Article::query()->where('status', Article::STATUS_PUBLISHED)->count(),
                'scheduled' => Article::query()->where('status', Article::STATUS_SCHEDULED)->count(),
                'featured' => Article::query()->where('status', Article::STATUS_PUBLISHED)->where('is_featured', true)->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Dashboard/WebsiteManagement/Articles/Form', [
            'article' => $this->defaultArticlePayload($request->user()?->name),
            'contentTypeOptions' => $this->contentTypeOptions(),
            'statusOptions' => $this->statusOptions(),
            'mode' => 'create',
        ]);
    }

    public function store(StoreArticleRequest $request): RedirectResponse
    {
        $article = Article::query()->create($this->payload($request));

        return redirect()
            ->route('articles.index')
            ->with('success', "Artikel '{$this->localizedTitle($article)}' berhasil ditambahkan.");
    }

    public function edit(Article $article): Response
    {
        return Inertia::render('Dashboard/WebsiteManagement/Articles/Form', [
            'article' => $this->serializeForForm($article),
            'contentTypeOptions' => $this->contentTypeOptions(),
            'statusOptions' => $this->statusOptions(),
            'mode' => 'edit',
        ]);
    }

    public function update(StoreArticleRequest $request, Article $article): RedirectResponse
    {
        $article->update($this->payload($request, $article));

        return redirect()
            ->route('articles.index')
            ->with('success', "Artikel '{$this->localizedTitle($article)}' berhasil diperbarui.");
    }

    public function destroy(Article $article): RedirectResponse
    {
        $this->deleteStoredAsset($article->image_path);
        $this->deleteStoredAsset($article->og_image_path);
        $article->delete();

        return back()->with('success', 'Artikel berhasil dihapus.');
    }

    private function payload(StoreArticleRequest $request, ?Article $article = null): array
    {
        $titleId = trim($request->string('title_id')->value());
        $titleEn = trim($request->string('title_en')->value());
        $excerptId = trim($request->string('excerpt_id')->value());
        $excerptEn = trim($request->string('excerpt_en')->value());
        $bodyId = trim($request->string('body_id')->value());
        $bodyEn = trim($request->string('body_en')->value());
        [$titleId, $titleEn] = $this->normalizeLocalizedPair($titleId, $titleEn);
        [$excerptId, $excerptEn] = $this->normalizeLocalizedPair($excerptId, $excerptEn);
        [$bodyId, $bodyEn] = $this->normalizeLocalizedPair($bodyId, $bodyEn);
        $status = $request->string('status')->value();
        $publishedAt = $request->filled('published_at') ? $request->date('published_at') : null;

        if ($status === Article::STATUS_PUBLISHED && $publishedAt === null) {
            $publishedAt = now();
        }

        if ($status === Article::STATUS_DRAFT) {
            $publishedAt = null;
        }

        $imagePath = $article?->image_path;
        if ($request->hasFile('cover_image')) {
            $this->deleteStoredAsset($imagePath);
            $imagePath = '/storage/'.$request->file('cover_image')->store('articles', 'public');
        }

        $ogImagePath = $article?->og_image_path;
        if ($request->hasFile('og_image')) {
            $this->deleteStoredAsset($ogImagePath);
            $ogImagePath = '/storage/'.$request->file('og_image')->store('articles', 'public');
        }

        [$metaTitleId, $metaTitleEn] = $this->normalizeLocalizedPair(
            trim($request->string('meta_title_id')->value()),
            trim($request->string('meta_title_en')->value()),
        );
        [$metaDescriptionId, $metaDescriptionEn] = $this->normalizeLocalizedPair(
            trim($request->string('meta_description_id')->value()),
            trim($request->string('meta_description_en')->value()),
        );

        return [
            'title' => ['id' => $titleId, 'en' => $titleEn],
            'slug' => $this->resolveSlug($request->string('slug')->value(), $titleId, $titleEn),
            'excerpt' => ['id' => $excerptId, 'en' => $excerptEn],
            'body' => ['id' => $bodyId, 'en' => $bodyEn],
            'image_path' => $imagePath,
            'content_type' => $request->string('content_type')->value(),
            'status' => $status,
            'author_name' => $this->resolveAuthorName($request),
            'tags' => $this->parseTags($request->string('tags')->value()),
            'meta_title' => [
                'id' => $metaTitleId,
                'en' => $metaTitleEn,
            ],
            'meta_description' => [
                'id' => $metaDescriptionId,
                'en' => $metaDescriptionEn,
            ],
            'og_image_path' => $ogImagePath,
            'reading_time_minutes' => $this->estimateReadingTime([$bodyId, $bodyEn]),
            'published_at' => $publishedAt,
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $status !== Article::STATUS_ARCHIVED,
        ];
    }

    private function serializeForAdmin(Article $article): array
    {
        return [
            'id' => $article->id,
            'title' => $this->localizedTitle($article),
            'slug' => $article->slug,
            'image_path' => $article->image_path,
            'content_type' => $article->content_type,
            'status' => $article->status,
            'author_name' => $article->author_name,
            'tags' => $article->tags ?? [],
            'reading_time_minutes' => $article->reading_time_minutes,
            'views_count' => $article->views_count,
            'published_at' => $article->published_at?->toDateTimeString(),
            'is_featured' => $article->is_featured,
            'is_active' => $article->is_active,
        ];
    }

    private function serializeForForm(Article $article): array
    {
        return [
            'id' => $article->id,
            'title_id' => (string) ($article->title['id'] ?? ''),
            'title_en' => (string) ($article->title['en'] ?? ''),
            'slug' => $article->slug,
            'excerpt_id' => (string) ($article->excerpt['id'] ?? ''),
            'excerpt_en' => (string) ($article->excerpt['en'] ?? ''),
            'body_id' => (string) ($article->body['id'] ?? ''),
            'body_en' => (string) ($article->body['en'] ?? ''),
            'image_path' => $article->image_path,
            'content_type' => $article->content_type,
            'status' => $article->status,
            'author_name' => $article->author_name,
            'tags' => implode(', ', $article->tags ?? []),
            'meta_title_id' => (string) ($article->meta_title['id'] ?? ''),
            'meta_title_en' => (string) ($article->meta_title['en'] ?? ''),
            'meta_description_id' => (string) ($article->meta_description['id'] ?? ''),
            'meta_description_en' => (string) ($article->meta_description['en'] ?? ''),
            'og_image_path' => $article->og_image_path,
            'published_at' => $article->published_at?->format('Y-m-d\TH:i'),
            'is_featured' => $article->is_featured,
        ];
    }

    private function defaultArticlePayload(?string $defaultAuthorName = null): array
    {
        return [
            'title_id' => '',
            'title_en' => '',
            'slug' => '',
            'excerpt_id' => '',
            'excerpt_en' => '',
            'body_id' => '',
            'body_en' => '',
            'image_path' => '',
            'content_type' => Article::TYPE_UMRAH_EDUCATION,
            'status' => Article::STATUS_DRAFT,
            'author_name' => $defaultAuthorName ?: 'Admin Travel',
            'tags' => '',
            'meta_title_id' => '',
            'meta_title_en' => '',
            'meta_description_id' => '',
            'meta_description_en' => '',
            'og_image_path' => '',
            'published_at' => '',
            'is_featured' => false,
        ];
    }

    private function contentTypeOptions(): array
    {
        return [
            ['value' => Article::TYPE_TRAVEL_UPDATE, 'label' => 'Travel Update'],
            ['value' => Article::TYPE_COMPANY_NEWS, 'label' => 'Company News'],
            ['value' => Article::TYPE_UMRAH_EDUCATION, 'label' => 'Umrah Education'],
            ['value' => Article::TYPE_GENERAL_NEWS, 'label' => 'General News'],
        ];
    }

    private function statusOptions(): array
    {
        return [
            ['value' => Article::STATUS_DRAFT, 'label' => 'Draft'],
            ['value' => Article::STATUS_SCHEDULED, 'label' => 'Scheduled'],
            ['value' => Article::STATUS_PUBLISHED, 'label' => 'Published'],
            ['value' => Article::STATUS_ARCHIVED, 'label' => 'Archived'],
        ];
    }

    private function localizedTitle(Article $article): string
    {
        return (string) ($article->title['id'] ?? $article->title['en'] ?? $article->slug);
    }

    private function resolveSlug(string $providedSlug, string $titleId, string $titleEn): string
    {
        $base = trim($providedSlug) !== '' ? $providedSlug : ($titleId !== '' ? $titleId : $titleEn);

        return Str::slug($base);
    }

    private function resolveAuthorName(StoreArticleRequest $request): string
    {
        $providedAuthorName = trim($request->string('author_name')->value());

        if ($providedAuthorName !== '') {
            return $providedAuthorName;
        }

        $authenticatedAuthorName = trim((string) $request->user()?->name);

        if ($authenticatedAuthorName !== '') {
            return $authenticatedAuthorName;
        }

        return 'Admin Travel';
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function normalizeLocalizedPair(string $indonesianValue, string $englishValue): array
    {
        if ($indonesianValue === '' && $englishValue === '') {
            return ['', ''];
        }

        if ($indonesianValue === '') {
            $indonesianValue = $englishValue;
        }

        if ($englishValue === '') {
            $englishValue = $indonesianValue;
        }

        return [$indonesianValue, $englishValue];
    }

    private function parseTags(string $tagString): array
    {
        return collect(explode(',', $tagString))
            ->map(fn (string $tag): string => trim($tag))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function estimateReadingTime(array $bodyValues): int
    {
        $text = implode(' ', array_filter($bodyValues));
        $wordCount = str_word_count(strip_tags($text));

        return max(1, (int) ceil($wordCount / 180));
    }

    private function deleteStoredAsset(?string $path): void
    {
        if ($path && str_starts_with($path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $path));
        }
    }
}
