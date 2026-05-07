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
                        ->orWhereRaw('LOWER(title) like ?', ["%{$search}%"]);
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

    public function preview(Article $article): Response
    {
        $relatedArticles = Article::query()
            ->visible()
            ->whereKeyNot($article->id)
            ->where('content_type', $article->content_type)
            ->latest('published_at')
            ->limit(3)
            ->get()
            ->map(fn (Article $relatedArticle): array => $this->serializeForPublicList($relatedArticle))
            ->all();

        return Inertia::render('public/artikel/show', [
            'article' => $this->serializeForPublicDetail($article),
            'relatedArticles' => $relatedArticles,
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
        $title = trim($request->string('title')->value());
        $excerpt = trim($request->string('excerpt')->value());
        $body = trim($request->string('body')->value());
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

        $metaTitle = trim($request->string('meta_title')->value());
        $metaDescription = trim($request->string('meta_description')->value());

        return [
            'title' => $title,
            'slug' => $this->resolveSlug($request->string('slug')->value(), $title),
            'excerpt' => $excerpt !== '' ? $excerpt : null,
            'body' => $body !== '' ? $body : null,
            'image_path' => $imagePath,
            'content_type' => $request->string('content_type')->value(),
            'status' => $status,
            'author_name' => $this->resolveAuthorName($request),
            'tags' => $this->parseTags($request->string('tags')->value()),
            'meta_title' => $metaTitle !== '' ? $metaTitle : null,
            'meta_description' => $metaDescription !== '' ? $metaDescription : null,
            'og_image_path' => $ogImagePath,
            'reading_time_minutes' => $this->estimateReadingTime($body),
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

    private function serializeForPublicList(Article $article): array
    {
        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => $article->excerpt,
            'image_path' => $article->image_path,
            'content_type' => $article->content_type,
            'author_name' => $article->author_name,
            'tags' => $article->tags ?? [],
            'published_at' => $article->published_at?->toDateTimeString(),
            'reading_time_minutes' => $article->reading_time_minutes,
            'is_featured' => $article->is_featured,
        ];
    }

    private function serializeForPublicDetail(Article $article): array
    {
        return [
            ...$this->serializeForPublicList($article),
            'body' => $article->body,
            'meta_title' => $article->meta_title,
            'meta_description' => $article->meta_description,
            'og_image_path' => $article->og_image_path,
            'views_count' => $article->views_count,
        ];
    }

    private function serializeForForm(Article $article): array
    {
        return [
            'id' => $article->id,
            'title' => (string) ($article->title ?? ''),
            'slug' => $article->slug,
            'excerpt' => (string) ($article->excerpt ?? ''),
            'body' => (string) ($article->body ?? ''),
            'image_path' => $article->image_path,
            'content_type' => $article->content_type,
            'status' => $article->status,
            'author_name' => $article->author_name,
            'tags' => implode(', ', $article->tags ?? []),
            'meta_title' => (string) ($article->meta_title ?? ''),
            'meta_description' => (string) ($article->meta_description ?? ''),
            'og_image_path' => $article->og_image_path,
            'published_at' => $article->published_at?->format('Y-m-d\TH:i'),
            'is_featured' => $article->is_featured,
        ];
    }

    private function defaultArticlePayload(?string $defaultAuthorName = null): array
    {
        return [
            'title' => '',
            'slug' => '',
            'excerpt' => '',
            'body' => '',
            'image_path' => '',
            'content_type' => Article::TYPE_UMRAH_EDUCATION,
            'status' => Article::STATUS_DRAFT,
            'author_name' => $defaultAuthorName ?: 'Admin',
            'tags' => '',
            'meta_title' => '',
            'meta_description' => '',
            'og_image_path' => '',
            'published_at' => '',
            'is_featured' => false,
        ];
    }

    private function contentTypeOptions(): array
    {
        return [
            ['value' => Article::TYPE_TRAVEL_UPDATE, 'label' => 'Update Perjalanan'],
            ['value' => Article::TYPE_COMPANY_NEWS, 'label' => 'Berita Perusahaan'],
            ['value' => Article::TYPE_UMRAH_EDUCATION, 'label' => 'Edukasi Umroh'],
            ['value' => Article::TYPE_GENERAL_NEWS, 'label' => 'Info Umum'],
        ];
    }

    private function statusOptions(): array
    {
        return [
            ['value' => Article::STATUS_DRAFT, 'label' => 'Draft'],
            ['value' => Article::STATUS_SCHEDULED, 'label' => 'Terjadwal'],
            ['value' => Article::STATUS_PUBLISHED, 'label' => 'Terbit'],
            ['value' => Article::STATUS_ARCHIVED, 'label' => 'Arsip'],
        ];
    }

    private function localizedTitle(Article $article): string
    {
        return (string) ($article->title ?? $article->slug);
    }

    private function resolveSlug(string $providedSlug, string $title): string
    {
        $base = trim($providedSlug) !== '' ? $providedSlug : $title;

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

        return 'Admin';
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

    private function estimateReadingTime(string $body): int
    {
        $wordCount = str_word_count(strip_tags($body));

        return max(1, (int) ceil($wordCount / 180));
    }

    private function deleteStoredAsset(?string $path): void
    {
        if ($path && str_starts_with($path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $path));
        }
    }
}
